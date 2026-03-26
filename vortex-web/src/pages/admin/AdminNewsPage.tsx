import { useState } from 'react'
import { useStore, type NewsData } from '../../lib/store'

export function AdminNewsPage() {
  const { news, deleteNews, addNews } = useStore()
  const [showModal, setShowModal] = useState(false)
  
  const [newArticle, setNewArticle] = useState<Partial<NewsData>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    tag: 'UPDATE',
    tagColor: 'bg-primary text-black',
    content: ''
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newArticle.title || !newArticle.content) return
    
    addNews({
      ...newArticle as NewsData,
      id: `news-${Date.now()}`
    })
    setShowModal(false)
    setNewArticle({
      title: '',
      date: new Date().toISOString().split('T')[0],
      tag: 'UPDATE',
      tagColor: 'bg-primary text-black',
      content: ''
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Broadcast Center</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">Manage global news feeds and system announcements</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-semibold tracking-wide text-sm px-6 py-3 rounded-2xl transition-all duration-300 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_-8px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-2 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">add_comment</span>
          New Broadcast
        </button>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Date</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Classification</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Headline</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
            {news.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.03] transition-colors duration-300 group">
                <td className="p-5 font-mono text-sm font-medium text-white/60 tracking-wider whitespace-nowrap">{item.date}</td>
                <td className="p-5">
                  <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md shadow-sm ${
                    item.tag === 'URGENT' || item.tag === 'BREAKING' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_15px_rgba(251,113,133,0.1)]' :
                    item.tag === 'NEW_DROP' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' :
                    'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]'
                  }`}>
                    {item.tag}
                  </span>
                </td>
                <td className="p-5 font-semibold text-sm text-white/90">{item.title}</td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteNews(item.id)} className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors">
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
            
            <h2 className="text-2xl font-semibold text-white mb-8 tracking-tight drop-shadow-sm">Initialize Broadcast</h2>
            <form onSubmit={handleAdd} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Headline</label>
                <input 
                  type="text" required 
                  value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 placeholder:text-white/20 shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Classification (Tag)</label>
                <select 
                  value={newArticle.tag} 
                  onChange={e => setNewArticle({...newArticle, tag: e.target.value})}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 shadow-inner appearance-none"
                >
                  <option value="UPDATE" className="bg-zinc-900">UPDATE</option>
                  <option value="URGENT" className="bg-zinc-900">URGENT</option>
                  <option value="BREAKING" className="bg-zinc-900">BREAKING</option>
                  <option value="NEW_DROP" className="bg-zinc-900">NEW DROP</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Transmission Content</label>
                <textarea 
                  required 
                  rows={4}
                  value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 placeholder:text-white/20 shadow-inner resize-none" 
                />
              </div>
              <div className="flex gap-4 pt-6 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3.5 rounded-2xl border border-white/[0.1] text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.03] transition-all duration-300">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3.5 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95">Transmit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
