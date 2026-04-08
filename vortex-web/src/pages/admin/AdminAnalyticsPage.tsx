import { useMemo } from 'react'
import { useStore } from '../../lib/store'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts'

export function AdminAnalyticsPage() {
  const { events, orderHistory, ownedTickets } = useStore()

  // Derive metrics
  const metrics = useMemo(() => {
    const totalRevenue = orderHistory.reduce((acc, o) => acc + o.total, 0) + 145200
    const ticketsSold = ownedTickets.length + 3450
    const avgTicketPrice = ticketsSold > 0 ? Math.round(totalRevenue / ticketsSold) : 0
    const conversionRate = 68.5 + (Math.random() * 5 - 2.5)
    return { totalRevenue, ticketsSold, avgTicketPrice, conversionRate: +conversionRate.toFixed(1) }
  }, [orderHistory, ownedTickets])

  // Revenue by event
  const revenueByEvent = useMemo(() => {
    return events.map(e => ({
      name: e.name.length > 12 ? e.name.slice(0, 12) + '...' : e.name,
      fullName: e.name,
      revenue: (e.capacity - e.ticketsLeft) * e.price,
      ticketsSold: e.capacity - e.ticketsLeft,
      occupancy: Math.round(((e.capacity - e.ticketsLeft) / e.capacity) * 100),
    }))
  }, [events])

  // Category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    events.forEach(e => {
      const cats = (e.categories && e.categories.length > 0) ? e.categories : ['Lainnya']
      cats.forEach(cat => {
        counts[cat] = (counts[cat] || 0) + 1
      })
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [events])

  // Monthly trend (simulated)
  const monthlyTrend = [
    { month: 'Jan', revenue: 85000, tickets: 120 },
    { month: 'Feb', revenue: 142000, tickets: 210 },
    { month: 'Mar', revenue: 98000, tickets: 160 },
    { month: 'Apr', revenue: 175000, tickets: 290 },
    { month: 'May', revenue: 210000, tickets: 340 },
    { month: 'Jun', revenue: 188000, tickets: 310 },
    { month: 'Jul', revenue: Math.max(230000, metrics.totalRevenue), tickets: metrics.ticketsSold > 400 ? metrics.ticketsSold : 400 },
  ]

  const COLORS = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c', '#94a3b8']

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl text-xs">
          <p className="text-white/60 font-semibold uppercase tracking-widest mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="font-mono font-bold" style={{ color: p.color }}>
              {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out z-10 relative pb-12">
      <div>
        <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Event Performance</h1>
        <p className="text-sm font-medium text-white/50 mt-1.5">Analytics dashboard for event metrics and revenue insights</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `CRD ${metrics.totalRevenue.toLocaleString()}`, icon: 'payments', color: 'text-indigo-300', bg: 'bg-indigo-500/20', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]', change: '+12.5%' },
          { label: 'Tickets Sold', value: metrics.ticketsSold.toLocaleString(), icon: 'confirmation_number', color: 'text-sky-300', bg: 'bg-sky-500/20', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.2)]', change: '+8.2%' },
          { label: 'Avg Ticket Price', value: `CRD ${metrics.avgTicketPrice.toLocaleString()}`, icon: 'trending_up', color: 'text-emerald-300', bg: 'bg-emerald-500/20', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.2)]', change: '+3.1%' },
          { label: 'Conversion Rate', value: `${metrics.conversionRate}%`, icon: 'donut_large', color: 'text-amber-300', bg: 'bg-amber-500/20', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.2)]', change: '+1.8%' },
        ].map(stat => (
          <div key={stat.label} className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-6 rounded-[32px] flex flex-col gap-4 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] hover:bg-white/[0.05] hover:scale-[1.02] transition-all duration-500 ease-out group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="flex justify-between items-start relative z-10">
              <div className={`w-12 h-12 rounded-[20px] ${stat.bg} ${stat.glow} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
                <span className={`material-symbols-outlined text-[24px] ${stat.color}`}>{stat.icon}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 backdrop-blur-md">{stat.change}</span>
            </div>
            <div className="relative z-10 pt-2">
              <p className="font-mono text-2xl font-semibold text-white tracking-tight drop-shadow-sm">{stat.value}</p>
              <p className="text-sm font-medium text-white/50 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Event */}
        <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h2 className="text-base font-semibold text-white/90 mb-6 tracking-wide">Revenue by Event</h2>
          <div className="h-64 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByEvent} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} isAnimationActive={false} />
                <Bar dataKey="revenue" fill="#818cf8" radius={[8, 8, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h2 className="text-base font-semibold text-white/90 mb-6 tracking-wide">Category Distribution</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={false} isAnimationActive={false} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {categoryData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-white/60">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <h2 className="text-base font-semibold text-white/90 mb-6 tracking-wide">Monthly Trend</h2>
        <div className="h-64 w-full -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} cursor={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              <Area type="monotone" dataKey="tickets" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorTickets)" name="Tickets" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Detail Table */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="p-6 pb-2">
          <h2 className="text-base font-semibold text-white/90 tracking-wide">Event Performance Detail</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Event</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Kategori</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Tickets Sold</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Revenue</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Occupancy</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {events.map(event => {
                const sold = event.capacity - event.ticketsLeft
                const occ = Math.round((sold / event.capacity) * 100)
                const rev = sold * event.price
                return (
                  <tr key={event.id} className="hover:bg-white/[0.03] transition-colors duration-300">
                    <td className="p-5 font-semibold text-sm text-white/90">{event.name}</td>
                    <td className="p-5">
                      <div className="flex flex-wrap gap-1">
                        {event.categories && event.categories.length > 0 ? event.categories.map((cat, i) => (
                           <span key={i} className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border bg-white/5 text-white/60 border-white/10">{cat}</span>
                        )) : (
                           <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border bg-white/5 text-white/60 border-white/10">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 font-mono text-sm text-white/70">{sold.toLocaleString()}</td>
                    <td className="p-5 font-mono text-sm text-indigo-300">CRD {rev.toLocaleString()}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-3 max-w-[120px]">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${occ >= 90 ? 'bg-rose-400' : occ >= 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${occ}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-white/50">{occ}%</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                        event.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                        event.status === 'LOCKED' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' :
                        'bg-white/5 text-white/50 border-white/10'
                      }`}>{event.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
