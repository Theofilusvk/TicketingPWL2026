import { useState, useEffect } from 'react'
import { useAudio } from '../lib/audio'

interface VenueSection {
  section_id?: number
  section_name: string
  capacity: number
  price: number
  map_position?: any
}

interface VenueSectionFormProps {
  eventId: number
  onSave?: (section: VenueSection) => void
  onCancel?: () => void
  initialSection?: VenueSection
}

export function VenueSectionForm({ eventId, onSave, onCancel, initialSection }: VenueSectionFormProps) {
  const { playClickSound, playHoverSound } = useAudio()
  const [formData, setFormData] = useState<VenueSection>(
    initialSection || {
      section_name: '',
      capacity: 100,
      price: 0,
    }
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()
    
    try {
      setLoading(true)
      setError(null)

      const method = initialSection ? 'PUT' : 'POST'
      const url = initialSection
        ? `/api/venue-sections/${initialSection.section_id}`
        : '/api/venue-sections'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          event_id: eventId,
          ...formData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save venue section')
      }

      const data = await response.json()
      onSave?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-black/60 border border-zinc-800 p-6 rounded-lg">
      <h3 className="font-display text-lg text-primary">
        {initialSection ? 'Edit Section' : 'Add New Section'}
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg font-accent text-xs">
          {error}
        </div>
      )}

      <div>
        <label className="block font-accent text-xs text-zinc-400 uppercase tracking-widest mb-2">
          Section Name
        </label>
        <input
          type="text"
          required
          value={formData.section_name}
          onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
          placeholder="e.g., VIP_WEST, GEN_ALPHA"
          className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 font-accent text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-accent text-xs text-zinc-400 uppercase tracking-widest mb-2">
            Capacity
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 font-accent text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block font-accent text-xs text-zinc-400 uppercase tracking-widest mb-2">
            Price (USD)
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 font-accent text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={() => { playClickSound(); onCancel() }}
            onMouseEnter={playHoverSound}
            className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-zinc-300 font-accent text-xs uppercase tracking-widest transition-colors rounded"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          onMouseEnter={playHoverSound}
          className="px-6 py-2 bg-primary text-black hover:bg-primary/90 disabled:opacity-50 font-accent font-bold text-xs uppercase tracking-widest rounded transition-colors"
        >
          {loading ? 'Saving...' : 'Save Section'}
        </button>
      </div>
    </form>
  )
}
