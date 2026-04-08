import { useState } from 'react'
import { useStore, EVENT_CATEGORIES } from '../../lib/store'

const EMAIL_TEMPLATES = [
  { id: 'venue-change', name: 'Venue Change', subject: 'VENUE UPDATE — Important', body: 'The venue for this event has been relocated. Please check the updated event page for the new address and directions.' },
  { id: 'schedule-update', name: 'Schedule Update', subject: 'SCHEDULE CHANGE — Action Required', body: 'The event schedule has been updated. New time slots are now available on the event page. Please adjust your plans accordingly.' },
  { id: 'general', name: 'General Announcement', subject: 'ANNOUNCEMENT — From Organizer', body: 'We have an important update regarding the event. Please read carefully and reach out if you have any questions.' },
]

export function AdminNotificationsPage() {
  const { events, sendEmailBlast, addNotification, ownedTickets } = useStore()
  const [activeTab, setActiveTab] = useState<'BLAST' | 'REMINDERS' | 'TEMPLATES'>('BLAST')

  // Email Blast state
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '')
  const [blastSubject, setBlastSubject] = useState('')
  const [blastBody, setBlastBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  // Reminder toggles
  const [reminders, setReminders] = useState<Record<string, { h3: boolean; h1: boolean }>>({})

  const handleSendBlast = () => {
    if (!selectedEventId || !blastSubject.trim() || !blastBody.trim()) return
    setIsSending(true)
    setSentSuccess(false)
    setTimeout(() => {
      sendEmailBlast(selectedEventId, blastSubject, blastBody)
      setIsSending(false)
      setSentSuccess(true)
      setBlastSubject('')
      setBlastBody('')
      setTimeout(() => setSentSuccess(false), 3000)
    }, 1500)
  }

  const toggleReminder = (eventId: string, type: 'h3' | 'h1') => {
    setReminders(prev => {
      const current = prev[eventId] || { h3: false, h1: false }
      const updated = { ...current, [type]: !current[type] }
      // Simulate notification generation
      if (updated[type]) {
        addNotification({
          id: `notif-reminder-${eventId}-${type}-${Date.now()}`,
          type: 'REMINDER',
          title: `REMINDER SET (${type === 'h3' ? 'H-3' : 'H-1'})`,
          message: `Automated reminder for ${events.find(e => e.id === eventId)?.name || 'event'} has been activated.`,
          eventId,
          timestamp: new Date().toISOString(),
          read: false
        })
      }
      return { ...prev, [eventId]: updated }
    })
  }

  const applyTemplate = (tpl: typeof EMAIL_TEMPLATES[0]) => {
    setBlastSubject(tpl.subject)
    setBlastBody(tpl.body)
    setActiveTab('BLAST')
  }

  const tabs = [
    { key: 'BLAST' as const, label: 'Email Blast', icon: 'campaign' },
    { key: 'REMINDERS' as const, label: 'Auto Reminders', icon: 'schedule_send' },
    { key: 'TEMPLATES' as const, label: 'Templates', icon: 'description' },
  ]

  const recipientCount = ownedTickets.filter(t => t.eventId === selectedEventId).length

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      <div>
        <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Communications Hub</h1>
        <p className="text-sm font-medium text-white/50 mt-1.5">Email blasts, automated reminders, and message templates</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-white/[0.03] rounded-2xl p-1 border border-white/[0.06] w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/70'}`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* BLAST TAB */}
      {activeTab === 'BLAST' && (
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] p-8 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Target Event</label>
              <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 [color-scheme:dark] appearance-none cursor-pointer">
                {events.map(e => <option key={e.id} value={e.id} className="bg-zinc-900">{e.name}</option>)}
              </select>
              <p className="text-[10px] text-white/30 pl-1">{recipientCount} ticket holder(s) will receive this blast</p>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Subject</label>
              <input type="text" value={blastSubject} onChange={e => setBlastSubject(e.target.value)} placeholder="Important Update..." className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Body</label>
              <textarea rows={5} value={blastBody} onChange={e => setBlastBody(e.target.value)} placeholder="Write your message..." className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 resize-none" />
            </div>
            <button
              onClick={handleSendBlast}
              disabled={isSending || !blastSubject.trim() || !blastBody.trim()}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-black font-semibold text-sm shadow-[0_0_20px_rgba(203,255,0,0.3)] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <><span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> Transmitting...</>
              ) : sentSuccess ? (
                <><span className="material-symbols-outlined text-lg">check_circle</span> Blast Sent!</>
              ) : (
                <><span className="material-symbols-outlined text-lg">send</span> Send Email Blast</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* REMINDERS TAB */}
      {activeTab === 'REMINDERS' && (
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] p-8 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="space-y-4">
            {events.filter(e => e.status === 'ACTIVE').map(event => {
              const r = reminders[event.id] || { h3: false, h1: false }
              return (
                <div key={event.id} className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
                  <div>
                    <p className="text-sm font-semibold text-white">{event.name}</p>
                    <p className="text-[10px] text-white/40 font-mono mt-1">{event.date} — {event.venue}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">H-3</span>
                      <div onClick={() => toggleReminder(event.id, 'h3')} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${r.h3 ? 'bg-primary' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${r.h3 ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">H-1</span>
                      <div onClick={() => toggleReminder(event.id, 'h1')} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${r.h1 ? 'bg-primary' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${r.h1 ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TEMPLATES TAB */}
      {activeTab === 'TEMPLATES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EMAIL_TEMPLATES.map(tpl => (
            <div key={tpl.id} className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] p-6 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="material-symbols-outlined text-3xl text-white/20 mb-4">draft</span>
              <h3 className="text-sm font-semibold text-white mb-1">{tpl.name}</h3>
              <p className="text-xs text-white/40 mb-1 font-mono">{tpl.subject}</p>
              <p className="text-[11px] text-white/30 flex-1 mb-4 line-clamp-3">{tpl.body}</p>
              <button onClick={() => applyTemplate(tpl)} className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all">
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
