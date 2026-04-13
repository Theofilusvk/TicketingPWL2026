import { useState, useEffect } from 'react'

export interface ApiUserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  tier: string;
  credits: number;
  lastActive: string;
}

export function AdminUsersPage() {
  const [apiUsers, setApiUsers] = useState<ApiUserAccount[]>([])
  const [selectedUser, setSelectedUser] = useState<ApiUserAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const tiers = ['PHANTOM', 'SQUIRE', 'KNIGHT', 'LORD', 'SOVEREIGN']

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('vortex.auth.token') || localStorage.getItem('auth_token')
      const res = await fetch('/api/admin/users', {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const json = await res.json()
        if (json.status === 'success') setApiUsers(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleUpdateTier = async (userId: string, newTier: string) => {
    try {
      const token = localStorage.getItem('vortex.auth.token') || localStorage.getItem('auth_token')
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Accept': 'application/json', 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ tier: newTier })
      })
      if (res.ok) {
        if (selectedUser) setSelectedUser({ ...selectedUser, tier: newTier })
        await fetchUsers()
      }
    } catch (err) {
      alert('Network error')
    }
  }

  const handleUpdateBalance = async (userId: string, adjustment: number) => {
    try {
      const token = localStorage.getItem('vortex.auth.token') || localStorage.getItem('auth_token')
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Accept': 'application/json', 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ credits_adjustment: adjustment })
      })
      if (res.ok) {
        if (selectedUser) setSelectedUser({ ...selectedUser, credits: Math.max(0, selectedUser.credits + adjustment) })
        await fetchUsers()
      }
    } catch (err) {
      alert('Network error')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      const token = localStorage.getItem('vortex.auth.token') || localStorage.getItem('auth_token')
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Accept': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }
      })
      if (res.ok) {
        setSelectedUser(null)
        await fetchUsers()
      } else {
        const err = await res.json()
        alert(err.message || 'Could not delete user')
      }
    } catch (err) {
      alert('Network error')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Audience Intel</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5 flex items-center gap-2">
            Manage registered users, ranks, and CRD balances
            {isLoading && <span className="text-indigo-400 animate-pulse">(Connecting...)</span>}
          </p>
        </div>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Identifier</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Current Rank</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Balance (CRD)</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Last Active</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
            {apiUsers.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.03] transition-colors duration-300 group">
                <td className="p-5">
                  <div className="font-semibold text-sm text-white/90">{item.name}</div>
                  <div className="font-mono text-[10px] text-zinc-500 mt-1">{item.email}</div>
                  {item.role === 'admin' && <span className="inline-flex mt-1 text-[8px] uppercase tracking-widest text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Admin</span>}
                </td>
                <td className="p-5">
                  <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md shadow-sm ${
                    item.tier === 'SOVEREIGN' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' :
                    item.tier === 'LORD' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]' :
                    item.tier === 'KNIGHT' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]' :
                    item.tier === 'SQUIRE' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' :
                    'bg-slate-500/10 text-slate-300 border-slate-500/20'
                  }`}>
                    {item.tier}
                  </span>
                </td>
                <td className="p-5 font-mono text-sm font-medium text-white/60 tracking-wider whitespace-nowrap">{item.credits.toLocaleString()}</td>
                <td className="p-5 font-mono text-xs font-medium text-white/40 whitespace-nowrap">{new Date(item.lastActive).toLocaleDateString()}</td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setSelectedUser(item)} className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors backdrop-blur-md border border-white/10">
                      Manage
                    </button>
                    <button onClick={() => handleDeleteUser(item.id)} className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {apiUsers.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-white/30 text-sm">No users found.</td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-500">
          <div className="bg-black/60 backdrop-blur-[60px] border border-white/[0.15] rounded-[32px] w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 ease-out relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight drop-shadow-sm">Modify Account</h2>
            <p className="text-sm text-zinc-400 font-mono mb-8">{selectedUser.name}</p>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1 border-b border-white/10 pb-2 flex">Adjust Rank</label>
                <div className="flex flex-wrap gap-2">
                  {tiers.map(t => (
                    <button 
                      key={t}
                      onClick={() => handleUpdateTier(selectedUser.id, t)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${selectedUser.tier === t ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(203,255,0,0.2)]' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1 border-b border-white/10 pb-2 flex">Adjust Balance (CRD)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleUpdateBalance(selectedUser.id, 10000)} className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 py-3 rounded-xl text-xs font-bold font-mono transition-colors">
                    + 10,000 CRD
                  </button>
                  <button onClick={() => handleUpdateBalance(selectedUser.id, -10000)} className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 py-3 rounded-xl text-xs font-bold font-mono transition-colors">
                    - 10,000 CRD
                  </button>
                </div>
              </div>

              <div className="pt-6 mt-2">
                <button onClick={() => setSelectedUser(null)} className="w-full px-4 py-3.5 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95">Complete Adjustment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
