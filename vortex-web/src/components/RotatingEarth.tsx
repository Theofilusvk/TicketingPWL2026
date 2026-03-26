import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface RotatingEarthProps {
  size?: number
  className?: string
}

export function RotatingEarth({ size = 500, className = '' }: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    // Check for touch device  
    const isTouch = window.matchMedia?.('(pointer: coarse)').matches ?? false

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    context.scale(dpr, dpr)

    const radius = size / 2.5

    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([size / 2, size / 2])
      .clipAngle(90)

    const path = d3.geoPath().projection(projection).context(context)

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point
      let inside = false
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }
      return inside
    }

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry
      if (geometry.type === 'Polygon') {
        if (!pointInPolygon(point, geometry.coordinates[0])) return false
        for (let i = 1; i < geometry.coordinates.length; i++) {
          if (pointInPolygon(point, geometry.coordinates[i])) return false
        }
        return true
      } else if (geometry.type === 'MultiPolygon') {
        for (const polygon of geometry.coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) { inHole = true; break }
            }
            if (!inHole) return true
          }
        }
      }
      return false
    }

    const generateDots = (feature: any, spacing = 18) => {
      const dots: [number, number][] = []
      const bounds = d3.geoBounds(feature)
      const [[minLng, minLat], [maxLng, maxLat]] = bounds
      const step = spacing * 0.08
      for (let lng = minLng; lng <= maxLng; lng += step) {
        for (let lat = minLat; lat <= maxLat; lat += step) {
          const pt: [number, number] = [lng, lat]
          if (pointInFeature(pt, feature)) dots.push(pt)
        }
      }
      return dots
    }

    interface DotData { lng: number; lat: number }
    const allDots: DotData[] = []
    let landFeatures: any

    const render = () => {
      context.clearRect(0, 0, size, size)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius

      // Globe background — dark with neon outline
      context.beginPath()
      context.arc(size / 2, size / 2, currentScale, 0, 2 * Math.PI)
      context.fillStyle = 'rgba(0, 0, 0, 0.4)'
      context.fill()
      context.strokeStyle = 'rgba(203, 255, 0, 0.3)'
      context.lineWidth = 1.5 * scaleFactor
      context.stroke()

      if (landFeatures) {
        // Graticule — VORTEX green tint
        const graticule = d3.geoGraticule()
        context.beginPath()
        path(graticule())
        context.strokeStyle = 'rgba(203, 255, 0, 0.1)'
        context.lineWidth = 0.5 * scaleFactor
        context.stroke()

        // Land outlines — brighter green
        context.beginPath()
        landFeatures.features.forEach((feature: any) => { path(feature) })
        context.strokeStyle = 'rgba(203, 255, 0, 0.25)'
        context.lineWidth = 0.8 * scaleFactor
        context.stroke()

        // Halftone dots — neon green
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat])
          if (projected && projected[0] >= 0 && projected[0] <= size && projected[1] >= 0 && projected[1] <= size) {
            context.beginPath()
            context.arc(projected[0], projected[1], 1 * scaleFactor, 0, 2 * Math.PI)
            context.fillStyle = 'rgba(203, 255, 0, 0.45)'
            context.fill()
          }
        })
      }
    }

    const loadData = async () => {
      try {
        const res = await fetch(
          'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json'
        )
        if (!res.ok) throw new Error('Failed to load')
        landFeatures = await res.json()
        landFeatures.features.forEach((feature: any) => {
          const dots = generateDots(feature, 18)
          dots.forEach(([lng, lat]) => allDots.push({ lng, lat }))
        })
        render()
      } catch {
        // Silently fail — globe is decorative
      }
    }

    // Rotation
    const rotation: [number, number] = [0, 0]
    let autoRotate = true

    const tick = () => {
      if (autoRotate) {
        rotation[0] += 0.3
        projection.rotate(rotation)
        render()
      }
    }

    const timer = d3.timer(tick)

    // Drag interaction (desktop only)
    if (!isTouch) {
      const handleMouseDown = (event: MouseEvent) => {
        autoRotate = false
        const startX = event.clientX
        const startY = event.clientY
        const startRot: [number, number] = [...rotation]

        const handleMouseMove = (e: MouseEvent) => {
          rotation[0] = startRot[0] + (e.clientX - startX) * 0.5
          rotation[1] = startRot[1] - (e.clientY - startY) * 0.5
          rotation[1] = Math.max(-90, Math.min(90, rotation[1]))
          projection.rotate(rotation)
          render()
        }

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          setTimeout(() => { autoRotate = true }, 10)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }

      canvas.addEventListener('mousedown', handleMouseDown)
    }

    loadData()

    return () => { timer.stop() }
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
