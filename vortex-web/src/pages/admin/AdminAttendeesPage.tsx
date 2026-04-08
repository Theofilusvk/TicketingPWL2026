import { useState, useMemo } from 'react'
import { useStore } from '../../lib/store'

export function AdminAttendeesPage() {
  const { events, ownedTickets, checkInTicket } = useStore()
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '')
  const [search, setSearch] = useState('')

  const attendees = useMemo(() => {
    return ownedTickets
      .filter(t => t.eventId === selectedEventId)
      .filter(t => {
        if (!search) return true
        const q = search.toLowerCase()
        return t.assignedName.toLowerCase().includes(q) || t.ticketId.toLowerCase().includes(q)
      })
  }, [ownedTickets, selectedEventId, search])

  const checkedIn = attendees.filter(t => t.status === 'SCANNED').length
  const total = attendees.length
  const pct = total > 0 ? Math.round((checkedIn / total) * 100) : 0

  const exportCSV = () => {
    const header = 'Name,Ticket ID,Tier,Gate,Purchase Date,Check-in Status\n'
    const rows = attendees.map(t =>
      `"${t.assignedName}","${t.ticketId}","${t.tier}","${t.gate}","${t.purchaseDate}","${t.status === 'SCANNED' ? 'CHECKED IN' : 'NOT CHECKED IN'}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendees-${selectedEventId}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportExcel = () => {
    // Simple HTML table export that Excel can read
    let html = '<table><tr><th>Name</th><th>Ticket ID</th><th>Tier</th><th>Gate</th><th>Purchase Date</th><th>Status</th></tr>'
    attendees.forEach(t => {
      html += `<tr><td>${t.assignedName}</td><td>${t.ticketId}</td><td>${t.tier}</td><td>${t.gate}</td><td>${t.purchaseDate}</td><td>${t.status === 'SCANNED' ? 'CHECKED IN' : 'NOT CHECKED IN'}</td></tr>`
    })
    html += '</table>'
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendees-${selectedEventId}-${Date.now()}.xls`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Attendee Manager</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">Check-in tracking, export, and attendee management</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-1 shadow-inner relative flex items-center min-w-[240px]">
          <span className="material-symbols-outlined text-white/40 absolute left-3 pointer-events-none">event</span>
          <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="w-full bg-transparent text-white font-semibold tracking-wide text-sm outline-none appearance-none cursor-pointer pl-10 pr-10 py-2 [color-scheme:dark]">
            {events.map(e => <option key={e.id} value={e.id} className="bg-zinc-900 text-white">{e.name}</option>)}
          </select>
          <span className="material-symbols-outlined text-white/40 absolute right-3 pointer-events-none">expand_content</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-2xl p-5 text-center">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1">Total Attendees</p>
          <p className="text-3xl font-bold text-white">{total}</p>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-2xl p-5 text-center">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1">Checked In</p>
          <p className="text-3xl font-bold text-emerald-400">{checkedIn}</p>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-2xl p-5">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2 text-center">Progress</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-bold text-white/80 font-mono">{pct}%</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined text-white/30 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ticket ID..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 placeholder:text-white/20"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/10 transition-all">
            <span className="material-symbols-outlined text-[16px]">download</span>Export CSV
          </button>
          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/10 transition-all">
            <span className="material-symbols-outlined text-[16px]">table_chart</span>Export Excel
          </button>
        </div>
      </div>

      {/* Attendee Table */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Name</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Ticket ID</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Tier</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Gate</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {attendees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-white/15 block mb-2">person_off</span>
                    <p className="text-sm text-white/30">No attendees found for this event</p>
                  </td>
                </tr>
              ) : attendees.map(t => (
                <tr key={t.ticketId} className="hover:bg-white/[0.03] transition-colors duration-300 group">
                  <td className="p-5 font-semibold text-sm text-white/90">{t.assignedName}</td>
                  <td className="p-5 font-mono text-xs text-white/60">{t.ticketId}</td>
                  <td className="p-5">
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border bg-white/5 border-white/10 text-white/60">{t.tier}</span>
                  </td>
                  <td className="p-5 font-mono text-xs text-white/50">{t.gate}</td>
                  <td className="p-5">
                    {t.status === 'SCANNED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>CHECKED IN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                        <span className="material-symbols-outlined text-[12px]">pending</span>PENDING
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    {t.status !== 'SCANNED' && (
                      <button
                        onClick={() => checkInTicket(t.ticketId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">how_to_reg</span>Check In
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
