import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

interface VenueSection {
  id: number
  name: string
  capacity: number
  sold: number
  available: number
  price: number
  position: any
  isSoldOut: boolean
  occupancy: number
}

interface VenueMapData {
  event_id: number
  total_capacity: number
  total_sold: number
  sections: VenueSection[]
}

export function VenueMapDisplay() {
  const { eventId } = useParams()
  const [venueData, setVenueData] = useState<VenueMapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVenueMap = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/venue-map`)
        if (!response.ok) throw new Error('Failed to fetch venue map')
        const data = await response.json()
        setVenueData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) fetchVenueMap()
  }, [eventId])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-zinc-800 rounded-lg" />
        <div className="h-10 bg-zinc-800 rounded w-1/3" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 font-accent text-xs uppercase">Error: {error}</div>
  }

  if (!venueData) {
    return <div className="text-zinc-400 font-accent text-xs uppercase">No venue data available</div>
  }

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy === 100) return 'bg-red-600 border-red-500'
    if (occupancy >= 75) return 'bg-yellow-600 border-yellow-500'
    if (occupancy >= 50) return 'bg-blue-600 border-blue-500'
    return 'bg-green-600 border-green-500'
  }

  const getOccupancyLabel = (occupancy: number) => {
    if (occupancy === 100) return 'SOLD OUT'
    if (occupancy >= 75) return 'ALMOST FULL'
    if (occupancy >= 50) return 'HALF FULL'
    return 'AVAILABLE'
  }

  return (
    <div className="reveal space-y-8">
      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/60 border border-zinc-800 p-4 rounded-lg">
          <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-2">Total Capacity</p>
          <p className="font-display text-3xl text-primary">{venueData.total_capacity}</p>
        </div>
        <div className="bg-black/60 border border-zinc-800 p-4 rounded-lg">
          <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-2">Sold Tickets</p>
          <p className="font-display text-3xl text-yellow-400">{venueData.total_sold}</p>
        </div>
        <div className="bg-black/60 border border-zinc-800 p-4 rounded-lg">
          <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-2">Available</p>
          <p className="font-display text-3xl text-green-400">{venueData.total_capacity - venueData.total_sold}</p>
        </div>
      </div>

      {/* Venue Sections Grid */}
      <div className="space-y-3">
        <h3 className="font-display text-xl text-primary">VENUE_SECTIONS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venueData.sections.map((section) => (
            <div
              key={section.id}
              className={`border-2 p-4 rounded-lg transition-all ${getOccupancyColor(section.occupancy)}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-display text-sm text-white mb-1">{section.name}</h4>
                  <p className="font-accent text-[8px] text-white/70 uppercase tracking-widest">
                    {getOccupancyLabel(section.occupancy)}
                  </p>
                </div>
                <span className="font-display text-2xl font-bold text-white">
                  {Math.round(section.occupancy)}%
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 mb-3 border-t border-white/20 pt-3">
                <div>
                  <p className="font-accent text-[7px] text-white/60 uppercase tracking-widest">Capacity</p>
                  <p className="font-mono text-sm text-white">{section.capacity}</p>
                </div>
                <div>
                  <p className="font-accent text-[7px] text-white/60 uppercase tracking-widest">Sold</p>
                  <p className="font-mono text-sm text-white">{section.sold}</p>
                </div>
                <div>
                  <p className="font-accent text-[7px] text-white/60 uppercase tracking-widest">Available</p>
                  <p className="font-mono text-sm text-green-300">{section.available}</p>
                </div>
                <div>
                  <p className="font-accent text-[7px] text-white/60 uppercase tracking-widest">Price</p>
                  <p className="font-mono text-sm text-yellow-300">${section.price}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/30">
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: `${section.occupancy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-black/60 border border-zinc-800 p-4 rounded-lg">
        <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-3">Status Legend</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded" />
            <span className="font-accent text-[8px] text-white">0-50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded" />
            <span className="font-accent text-[8px] text-white">50-75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-600 rounded" />
            <span className="font-accent text-[8px] text-white">75-99%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded" />
            <span className="font-accent text-[8px] text-white">100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
