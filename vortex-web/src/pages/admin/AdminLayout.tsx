import { useState } from 'react'
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useStore } from '../../lib/store'

export function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuth()
  const { events, orderHistory, ownedTickets, users } = useStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" replace />
  }

  const isOrganizer = user.role === 'organizer'

  const navSections = [
    {
      title: 'Overview',
      items: [
        { to: '/admin', icon: 'grid_view', label: 'Dashboard' },
        { to: '/admin/analytics', icon: 'analytics', label: 'Analytics' },
        { to: '/admin/reports', icon: 'summarize', label: 'Reports' },
      ]
    },
    {
      title: 'Manage',
      items: [
        { to: '/admin/events', icon: 'stadium', label: 'Events' },
        { to: '/admin/venues', icon: 'map', label: 'Venues' },
        { to: '/admin/scanner', icon: 'document_scanner', label: 'Validation' },
        ...(!isOrganizer ? [
          { to: '/admin/users', icon: 'group', label: 'Users' },
        ] : []),
      ]
    },
    {
      title: 'Content',
      items: [
        { to: '/admin/drops', icon: 'sell', label: 'Merchandise' },
        { to: '/admin/news', icon: 'campaign', label: 'Broadcasts' },
        { to: '/admin/notifications', icon: 'notifications', label: 'Notifications' },
      ]
    },
  ]

  // Quick stats for sidebar
  const pendingOrders = orderHistory.length + 5
  const totalRevenue = orderHistory.reduce((acc, o) => acc + o.total, 145200)
  const activeEvents = events.filter(e => e.status === 'ACTIVE').length

  const quickStats = [
    { label: 'Pending', value: pendingOrders.toString(), icon: 'pending_actions', color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Revenue', value: `${Math.round(totalRevenue / 1000)}k`, icon: 'payments', color: 'text-indigo-400 bg-indigo-500/10' },
    { label: 'Events', value: activeEvents.toString(), icon: 'event', color: 'text-emerald-400 bg-emerald-500/10' },
  ]

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <Link to="/admin" className="flex items-center gap-3 px-2" onClick={() => setSidebarOpen(false)}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="material-symbols-outlined text-white text-[20px]">cyclone</span>
        </div>
        <div>
          <span className="font-semibold text-lg tracking-tight block leading-tight text-white">Vortex</span>
          <span className="text-[10px] font-medium tracking-widest text-indigo-400 uppercase block">
            {isOrganizer ? 'Organizer' : 'Console'}
          </span>
        </div>
      </Link>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mt-6 px-1">
        {quickStats.map(s => (
          <div key={s.label} className={`rounded-xl p-2.5 text-center ${s.color}`}>
            <p className="font-mono text-sm font-bold">{s.value}</p>
            <p className="text-[8px] font-semibold uppercase tracking-widest opacity-60 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 mt-6 space-y-5 overflow-y-auto">
        {navSections.map(section => (
          <div key={section.title}>
            <p className="px-3 mb-2 text-[9px] font-bold text-white/25 uppercase tracking-[0.2em]">{section.title}</p>
            <div className="space-y-1">
              {section.items.map(item => {
                const isActive = location.pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' 
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/40'}`}>{item.icon}</span>
                    <span className="tracking-tight">{item.label}</span>
                    {item.label === 'Notifications' && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-bold flex items-center justify-center">3</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Organizer Badge */}
      {isOrganizer && (
        <div className="mx-2 mb-3 p-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-[18px]">verified</span>
            <div>
              <p className="text-xs font-semibold text-indigo-300">Organizer Mode</p>
              <p className="text-[9px] text-white/30">Limited access panel</p>
            </div>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="pt-4 border-t border-zinc-800/50">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 border border-white/[0.08] shadow-sm">
            <span className="material-symbols-outlined text-xl">account_circle</span>
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium text-zinc-200 truncate">{user.displayName}</p>
            <p className="text-[10px] text-zinc-500 font-mono truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-white/[0.08] text-xs font-semibold tracking-wide text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            Site
          </Link>
          <button 
            onClick={() => { logout(); window.location.href = '/' }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-white/[0.08] text-xs font-semibold tracking-wide text-white/50 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Exit
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex font-sans selection:bg-white/20 transition-colors duration-500 cursor-default">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/[0.08] bg-white/[0.02] backdrop-blur-[40px] p-5 flex-col gap-4 hidden md:flex shrink-0 z-10 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.2)]">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0a0a] border-r border-white/[0.08] p-5 flex flex-col gap-4 animate-in slide-in-from-left duration-300 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#050505]">
        {/* Vibrant Background */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[140px] pointer-events-none translate-x-1/3" />
        <div className="absolute top-3/4 left-10 w-[400px] h-[400px] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Mobile Header */}
        <header className="md:hidden border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-[40px] px-4 py-3 flex items-center justify-between z-20 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white transition-colors p-1">
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[14px]">cyclone</span>
            </div>
            <span className="font-semibold text-white tracking-tight text-sm">Vortex Console</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-white/40 hover:text-white transition-colors relative p-1">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500" />
            </button>
            <button onClick={() => { logout(); window.location.href = '/' }} className="text-white/40 hover:text-white transition-colors p-1">
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
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
