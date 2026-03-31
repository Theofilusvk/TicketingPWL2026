import { useState } from 'react'
import { useStore, type EventData } from '../../lib/store'

export function AdminEventsPage() {
  const { events, deleteEvent, addEvent, updateEvent } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const initialFormState: Partial<EventData> = {
    name: '',
    date: '',
    status: 'ACTIVE',
    ticketsLeft: 500,
    capacity: 500,
    venue: '',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&q=80'
  }

  const [newEvent, setNewEvent] = useState<Partial<EventData>>(initialFormState)

  const openAddModal = () => {
    setIsEditing(false)
    setEditingId(null)
    setNewEvent(initialFormState)
    setShowModal(true)
  }

  const openEditModal = (event: EventData) => {
    setIsEditing(true)
    setEditingId(event.id)
    setNewEvent({
      name: event.name,
      date: event.date.includes('_') ? event.date.replace(/_/g, '-') : event.date,
      venue: event.venue,
      status: event.status,
      capacity: event.capacity,
      price: event.price
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.name || !newEvent.date) return
    
    try {
      const payload = {
        title: newEvent.name,
        location: newEvent.venue || 'THE FOUNDRY',
        start_time: `${newEvent.date} 19:00:00`,
        end_time: `${newEvent.date} 23:59:59`,
        organizer_id: 2, 
        category_id: 1,
      }

      const url = isEditing 
        ? `http://127.0.0.1:8000/api/events/${editingId}`
        : 'http://127.0.0.1:8000/api/events'
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        if (isEditing) {
          updateEvent(editingId!, {
            ...newEvent,
            id: editingId!
          })
        } else {
          addEvent({
            ...(newEvent as EventData),
            id: result.data.event_id.toString(),
          })
        }
        setShowModal(false)
        setNewEvent(initialFormState)
      } else {
        alert('Action failed: ' + (result.message || 'Validation error'))
      }
    } catch (err) {
      alert('Could not connect to backend.')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Event Management</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">Add, edit, and monitor global events</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-semibold tracking-wide text-sm px-6 py-3 rounded-2xl transition-all duration-300 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_-8px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-2 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">add</span>
          New Event
        </button>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">System ID</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Event Name</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Date</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Capacity</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-white/[0.03] transition-colors duration-300 group">
                <td className="p-5 font-mono text-xs text-white/40 tracking-wider">#{event.id.split('-')[0].toUpperCase()}</td>
                <td className="p-5 font-semibold text-sm text-white/90">{event.name}</td>
                <td className="p-5 text-sm font-medium text-white/60">{event.date}</td>
                <td className="p-5">
                  <div className="flex items-center gap-3 max-w-[150px]">
                    <div className="flex-1 h-1.5 bg-white/10 border border-white/5 rounded-full relative overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                      <div 
                        className={`absolute inset-y-0 left-0 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] ${event.ticketsLeft > 0 ? 'bg-indigo-400' : 'bg-rose-500'}`}
                        style={{ width: `${Math.max(5, Math.min(100, (event.ticketsLeft / event.capacity) * 100))}%` }} 
                      />
                    </div>
                    <span className="font-mono text-xs font-medium text-white/60">{event.ticketsLeft}</span>
                  </div>
                </td>
                <td className="p-5">
                  <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md shadow-sm ${
                    event.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]' :
                    event.status === 'DRAFT' ? 'bg-white/5 text-white/50 border-white/10' :
                    'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_15px_rgba(251,113,133,0.1)]'
                  }`}>
                    {event.status}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(event)}
                      className="text-zinc-500 hover:text-white p-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this event?')) {
                          try {
                            const res = await fetch(`http://127.0.0.1:8000/api/events/${event.id}`, {
                              method: 'DELETE',
                              headers: { 'Accept': 'application/json' }
                            });
                            if (res.ok) {
                              deleteEvent(event.id);
                            } else {
                              alert('Could not delete event from database.');
                            }
                          } catch (err) {
                            alert('Network error.');
                          }
                        }
                      }} 
                      className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-500">
          <div className="bg-black/60 backdrop-blur-[60px] border border-white/[0.15] rounded-[32px] w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 ease-out relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            <h2 className="text-2xl font-semibold text-white mb-8 tracking-tight drop-shadow-sm">{isEditing ? 'Update Event' : 'Initialize Event'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Event Name</label>
                <input 
                  type="text" required 
                  value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 placeholder:text-white/20 shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Date</label>
                <input 
                  type="date" required 
                  value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 [color-scheme:dark] shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Venue</label>
                <input 
                  type="text" required 
                  value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 shadow-inner" 
                />
              </div>
              <div className="flex gap-4 pt-6 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3.5 rounded-2xl border border-white/[0.1] text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.03] transition-all duration-300">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3.5 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95">{isEditing ? 'Save Changes' : 'Deploy'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
