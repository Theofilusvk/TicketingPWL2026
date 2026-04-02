import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

export function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" replace />
  }

  const navItems = [
    { to: '/admin', icon: 'grid_view', label: 'Dashboard' },
    { to: '/admin/analytics', icon: 'analytics', label: 'Analytics' },
    { to: '/admin/scanner', icon: 'document_scanner', label: 'Validation' },
    { to: '/admin/venues', icon: 'map', label: 'Venues' },
    { to: '/admin/events', icon: 'stadium', label: 'Events' },
    { to: '/admin/users', icon: 'group', label: 'Audience' },
    { to: '/admin/drops', icon: 'sell', label: 'Merchandise' },
    { to: '/admin/news', icon: 'campaign', label: 'Broadcasts' },
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex font-sans selection:bg-white/20 transition-colors duration-500 cursor-default">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-white/[0.08] bg-white/[0.02] backdrop-blur-[40px] p-5 flex-col gap-8 hidden md:flex shrink-0 z-10 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.2)]">
        <Link to="/admin" className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="material-symbols-outlined text-white text-[18px]">cyclone</span>
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight block leading-tight text-white">Vortex</span>
            <span className="text-[10px] font-medium tracking-widest text-indigo-400 uppercase block">Console</span>
          </div>
        </Link>

        <nav className="flex-1 space-y-1.5 mt-4">
          {navItems.map(item => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' 
                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/40'}`}>{item.icon}</span>
                <span className="tracking-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="pt-5 border-t border-zinc-800/50">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 border border-white/[0.08] shadow-sm">
              <span className="material-symbols-outlined text-xl">account_circle</span>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-zinc-200 truncate">{user.displayName}</p>
              <p className="text-[10px] text-zinc-500 font-mono truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => { logout(); window.location.href = '/' }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-white/[0.08] text-xs font-semibold tracking-wide text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 hover:shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Exit Console
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#050505]">
        {/* iOS-Style Vibrant Background Glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[140px] pointer-events-none translate-x-1/3" />
        <div className="absolute top-3/4 left-10 w-[400px] h-[400px] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Mobile Header */}
        <header className="md:hidden border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-[40px] p-4 flex items-center justify-between z-20 shadow-sm">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
               <span className="material-symbols-outlined text-white text-[14px]">cyclone</span>
             </div>
             <span className="font-semibold text-white tracking-tight">Vortex Console</span>
           </div>
           <button onClick={() => { logout(); window.location.href = '/' }} className="text-white/50 hover:text-white transition-colors">
             <span className="material-symbols-outlined">logout</span>
           </button>
        </header>
        
        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
