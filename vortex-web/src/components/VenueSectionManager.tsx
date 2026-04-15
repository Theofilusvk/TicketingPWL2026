import { useState, useEffect } from 'react'
import { useAudio } from '../lib/audio'
import { VenueSectionForm } from './VenueSectionForm'

interface VenueSection {
  section_id?: number
  section_name: string
  capacity: number
  price: number
  sold_tickets?: number
  status?: string
}

interface VenueSectionManagerProps {
  eventId: number
}

export function VenueSectionManager({ eventId }: VenueSectionManagerProps) {
  const { playClickSound, playHoverSound } = useAudio()
  const [sections, setSections] = useState<VenueSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSection, setEditingSection] = useState<VenueSection | null>(null)

  const fetchSections = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${eventId}/sections`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch sections')
      const data = await response.json()
      setSections(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) fetchSections()
  }, [eventId])

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return

    try {
      playClickSound()
      const response = await fetch(`/api/venue-sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete section')

      setSections(sections.filter(s => s.section_id !== sectionId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleSaveSection = (section: VenueSection) => {
    if (editingSection) {
      setSections(sections.map(s => s.section_id === section.section_id ? section : s))
    } else {
      setSections([...sections, section])
    }
    setShowForm(false)
    setEditingSection(null)
    fetchSections() // Refresh to get accurate data
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-lg text-primary">VENUE_SECTIONS</h3>
        <button
          onClick={() => { playClickSound(); setShowForm(true); setEditingSection(null) }}
          onMouseEnter={playHoverSound}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-black hover:bg-primary/90 font-accent font-bold text-xs uppercase tracking-widest rounded transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Section
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg font-accent text-xs">
          {error}
        </div>
      )}

      {showForm && (
        <VenueSectionForm
          eventId={eventId}
          initialSection={editingSection || undefined}
          onSave={handleSaveSection}
          onCancel={() => { setShowForm(false); setEditingSection(null) }}
        />
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-zinc-800 rounded-lg" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-zinc-700 rounded-lg">
          <span className="material-symbols-outlined text-4xl text-zinc-600 block mb-3">layers</span>
          <p className="font-accent text-xs text-zinc-500 uppercase tracking-widest">
            No sections added yet. Create your first venue section.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sections.map((section) => (
            <div
              key={section.section_id}
              className="border border-zinc-800 bg-black/60 p-4 rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-display text-base text-white">{section.section_name}</h4>
                  <p className="font-accent text-[7px] text-zinc-500 uppercase tracking-widest">
                    Section ID: {section.section_id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { playClickSound(); setEditingSection(section); setShowForm(true) }}
                    onMouseEnter={playHoverSound}
                    className="p-2 hover:bg-zinc-800 rounded transition-colors"
                    title="Edit section"
                  >
                    <span className="material-symbols-outlined text-sm text-zinc-400 hover:text-primary">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.section_id!)}
                    onMouseEnter={playHoverSound}
                    className="p-2 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete section"
                  >
                    <span className="material-symbols-outlined text-sm text-zinc-400 hover:text-red-400">delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="bg-zinc-900 p-3 rounded-lg">
                  <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Capacity</p>
                  <p className="font-display text-lg text-white">{section.capacity}</p>
                </div>
                <div className="bg-zinc-900 p-3 rounded-lg">
                  <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Price</p>
                  <p className="font-display text-lg text-primary">${section.price}</p>
                </div>
                <div className="bg-zinc-900 p-3 rounded-lg">
                  <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Sold</p>
                  <p className="font-display text-lg text-yellow-400">{section.sold_tickets || 0}</p>
                </div>
                <div className="bg-zinc-900 p-3 rounded-lg">
                  <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Status</p>
                  <p className={`font-accent text-xs uppercase tracking-widest ${
                    section.status === 'active' ? 'text-green-400' : 'text-zinc-500'
                  }`}>
                    {section.status || 'active'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total Summary */}
      {sections.length > 0 && (
        <div className="bg-black/60 border border-primary/30 p-4 rounded-lg">
          <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-3">Summary</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Total Capacity</p>
              <p className="font-display text-2xl text-white">
                {sections.reduce((acc, s) => acc + s.capacity, 0)}
              </p>
            </div>
            <div>
              <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Total Sold</p>
              <p className="font-display text-2xl text-yellow-400">
                {sections.reduce((acc, s) => acc + (s.sold_tickets || 0), 0)}
              </p>
            </div>
            <div>
              <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Available</p>
              <p className="font-display text-2xl text-green-400">
                {sections.reduce((acc, s) => acc + (s.capacity - (s.sold_tickets || 0)), 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
