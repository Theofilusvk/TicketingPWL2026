import { useState, useMemo } from 'react'
import { useStore, type RefundRequest } from '../../lib/store'

export function AdminRefundsPage() {
  const { events, refundRequests, approveRefund, rejectRefund, autoCancelEvent } = useStore()
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelEventId, setCancelEventId] = useState('')
  const [confirmText, setConfirmText] = useState('')

  const filtered = useMemo(() => {
    if (filterStatus === 'ALL') return refundRequests
    return refundRequests.filter(r => r.status === filterStatus)
  }, [refundRequests, filterStatus])

  const handleCancelEvent = () => {
    if (!cancelEventId || confirmText !== 'CANCEL') return
    autoCancelEvent(cancelEventId)
    setShowCancelModal(false)
    setConfirmText('')
    setCancelEventId('')
  }

  const statusBadge = (status: RefundRequest['status']) => {
    const styles = {
      PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    }
    return <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${styles[status]}`}>{status}</span>
  }

  const pendingCount = refundRequests.filter(r => r.status === 'PENDING').length
  const totalRefunded = refundRequests.filter(r => r.status === 'APPROVED').reduce((a, r) => a + r.amount, 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Refund Center</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">Process refund requests and event cancellations</p>
        </div>
        <button
          onClick={() => setShowCancelModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-sm hover:bg-rose-500/20 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">event_busy</span>Cancel Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-2xl p-5 text-center">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1">Total Requests</p>
          <p className="text-3xl font-bold text-white">{refundRequests.length}</p>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-2xl p-5 text-center">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1">Pending</p>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-2xl p-5 text-center">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1">Total Refunded</p>
          <p className="text-3xl font-bold text-emerald-400">CRD {totalRefunded.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white/[0.03] rounded-2xl p-1 border border-white/[0.06] w-fit">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
            {s}
            {s === 'PENDING' && pendingCount > 0 && <span className="ml-1.5 w-4 h-4 bg-amber-500 text-black text-[9px] inline-flex items-center justify-center rounded-full">{pendingCount}</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">User</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Event</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Amount</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Reason</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Status</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-white/15 block mb-2">receipt_long</span>
                    <p className="text-sm text-white/30">No refund requests found</p>
                  </td>
                </tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="p-5">
                    <p className="text-sm font-semibold text-white/90">{r.userName}</p>
                    <p className="text-[10px] text-white/30 font-mono">{r.ticketId}</p>
                  </td>
                  <td className="p-5 text-sm text-white/70">{r.eventName}</td>
                  <td className="p-5 font-mono text-sm font-medium text-white/80">CRD {r.amount.toLocaleString()}</td>
                  <td className="p-5 text-xs text-white/50 max-w-[200px] truncate">{r.reason}</td>
                  <td className="p-5">{statusBadge(r.status)}</td>
                  <td className="p-5 text-right">
                    {r.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => approveRefund(r.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-colors">
                          <span className="material-symbols-outlined text-[14px]">check</span>Approve
                        </button>
                        <button onClick={() => rejectRefund(r.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/20 transition-colors">
                          <span className="material-symbols-outlined text-[14px]">close</span>Reject
                        </button>
                      </div>
                    )}
                    {r.resolvedDate && (
                      <p className="text-[10px] text-white/25 font-mono">{new Date(r.resolvedDate).toLocaleDateString()}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Event Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-black/80 backdrop-blur-[60px] border border-rose-500/20 rounded-[32px] w-full max-w-md p-8 shadow-[0_24px_80px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <span className="material-symbols-outlined text-rose-400 text-xl">warning</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Cancel Event & Auto-Refund</h2>
                <p className="text-xs text-rose-400/70">This action is irreversible</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Select Event to Cancel</label>
                <select value={cancelEventId} onChange={e => setCancelEventId(e.target.value)} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white [color-scheme:dark] appearance-none">
                  <option value="" className="bg-zinc-900">-- Select Event --</option>
                  {events.filter(e => e.status === 'ACTIVE').map(e => <option key={e.id} value={e.id} className="bg-zinc-900">{e.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Type "CANCEL" to confirm</label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  className="w-full bg-white/[0.05] border border-rose-500/20 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none font-mono uppercase"
                  placeholder="CANCEL"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setShowCancelModal(false); setConfirmText(''); setCancelEventId('') }} className="flex-1 py-3 rounded-2xl border border-white/10 text-sm font-semibold text-white/60 hover:bg-white/5 transition-all">
                  Abort
                </button>
                <button onClick={handleCancelEvent} disabled={!cancelEventId || confirmText !== 'CANCEL'} className="flex-1 py-3 rounded-2xl bg-rose-500 text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rose-600 transition-all">
                  Cancel & Refund All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
