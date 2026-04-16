import { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'

type ApiEventComparison = {
  event_id: number
  title: string
  start_time: string
  status: string
  total_revenue: number
  tickets_sold: number
  total_capacity: number
  occupancy_rate: number
  refund_count: number
  total_orders: number
  refund_rate: number
  trend: { month: string; monthly_revenue: number; monthly_orders: number }[]
}

type ApiRevenue = {
  summary: { total_revenue: number; total_orders: number; avg_order_value: number }
  revenue_per_event: { event_id: number; title: string; total_revenue: string; total_orders: number }[]
  daily_revenue: { date: string; revenue: string; orders: number }[]
}

export function OrganizerAnalyticsPage() {
  const [apiComparison, setApiComparison] = useState<ApiEventComparison[]>([])
  const [apiRevenue, setApiRevenue] = useState<ApiRevenue | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('vortex.auth.token')
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const params = new URLSearchParams()
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)

    setLoading(true)
    Promise.all([
      fetch(`/api/organizer/analytics/event-comparison?${params}`, { headers }).then(r => r.json()),
      fetch(`/api/organizer/analytics/revenue?${params}`, { headers }).then(r => r.json()),
    ])
      .then(([compRes, revRes]) => {
        if (compRes.status === 'success') setApiComparison(compRes.data)
        if (revRes.status === 'success') setApiRevenue(revRes.data)
      })
      .catch(err => console.error('Organizer Analytics API error:', err))
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo])

  const metrics = useMemo(() => {
    if (apiRevenue) {
      const totalRevenue = apiRevenue.summary.total_revenue
      const ticketsSold = apiComparison.reduce((acc, e) => acc + e.tickets_sold, 0)
      const totalCapacity = apiComparison.reduce((acc, e) => acc + e.total_capacity, 0)
      const avgTicketPrice = ticketsSold > 0 ? Math.round(totalRevenue / ticketsSold) : 0
      const occupancyRate = totalCapacity > 0 ? Math.round((ticketsSold / totalCapacity) * 100) : 0
      return { totalRevenue, ticketsSold, avgTicketPrice, occupancyRate, totalCapacity, totalOrders: apiRevenue.summary.total_orders }
    }
    return { totalRevenue: 0, ticketsSold: 0, avgTicketPrice: 0, occupancyRate: 0, totalCapacity: 0, totalOrders: 0 }
  }, [apiComparison, apiRevenue])

  const revenueByEvent = useMemo(() => {
    return apiComparison
      .filter(e => e.total_revenue > 0)
      .map(e => ({
        name: e.title.length > 14 ? e.title.slice(0, 14) + '…' : e.title,
        fullName: e.title,
        revenue: e.total_revenue,
        ticketsSold: e.tickets_sold,
        occupancy: e.occupancy_rate,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [apiComparison])

  const ticketsPieData = useMemo(() => {
    const totalSold = apiComparison.reduce((acc, e) => acc + e.tickets_sold, 0)
    const totalAvailable = apiComparison.reduce((acc, e) => acc + (e.total_capacity - e.tickets_sold), 0)
    return [
      { name: 'Sold', value: totalSold },
      { name: 'Available', value: totalAvailable > 0 ? totalAvailable : 0 },
    ]
  }, [apiComparison])

  const performanceComparison = useMemo(() => {
    const monthMap: Record<string, any> = {}
    apiComparison.slice(0, 5).forEach(event => {
      event.trend.forEach(t => {
        if (!monthMap[t.month]) monthMap[t.month] = { month: t.month }
        monthMap[t.month][event.title] = t.monthly_revenue
      })
    })
    return Object.values(monthMap).sort((a: any, b: any) => a.month.localeCompare(b.month))
  }, [apiComparison])

  const PIE_COLORS = ['#818cf8', '#1e293b']
  const LINE_COLORS = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#f472b6']

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl text-xs max-w-[250px]">
          <p className="text-white/60 font-semibold uppercase tracking-widest mb-1.5">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="font-mono font-bold truncate" style={{ color: p.color || p.stroke }}>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">My Event Analytics</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">Performance metrics for your assigned events only</p>
          {loading && <p className="text-xs text-indigo-400 mt-1 animate-pulse">Loading live data from server...</p>}
          {!loading && apiComparison.length === 0 && (
            <p className="text-xs text-amber-400 mt-1">No assigned events found. Enroll to events first.</p>
          )}
        </div>
      </div>

      {/* Date Filters */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[24px] p-5 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest pl-1">From Date</label>
              <input
                type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-all [color-scheme:dark]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest pl-1">To Date</label>
              <input
                type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} min={dateFrom}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-all [color-scheme:dark]"
              />
            </div>
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo('') }}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$ ${metrics.totalRevenue.toLocaleString()}`, icon: 'payments', color: 'text-indigo-300', bg: 'bg-indigo-500/20', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]', change: `${metrics.totalOrders} orders` },
          { label: 'Tickets Sold', value: metrics.ticketsSold.toLocaleString(), icon: 'confirmation_number', color: 'text-sky-300', bg: 'bg-sky-500/20', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.2)]', change: `of ${metrics.totalCapacity.toLocaleString()}` },
          { label: 'Avg Ticket Price', value: `$ ${metrics.avgTicketPrice.toLocaleString()}`, icon: 'trending_up', color: 'text-emerald-300', bg: 'bg-emerald-500/20', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.2)]', change: 'per ticket' },
          { label: 'Occupancy Rate', value: `${metrics.occupancyRate}%`, icon: 'donut_large', color: 'text-amber-300', bg: 'bg-amber-500/20', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.2)]', change: 'capacity' },
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

      {/* Performance Comparison Line Chart */}
      {performanceComparison.length > 0 && (
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h2 className="text-base font-semibold text-white/90 mb-6 tracking-wide">Monthly Revenue Trend</h2>
          <div className="h-72 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceComparison} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }} />
                {apiComparison.slice(0, 5).map((event, i) => (
                  <Line
                    key={event.event_id}
                    type="monotone"
                    dataKey={event.title}
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: LINE_COLORS[i % LINE_COLORS.length] }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Event */}
        <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h2 className="text-base font-semibold text-white/90 mb-6 tracking-wide">Revenue by Event</h2>
          {revenueByEvent.length > 0 ? (
            <div className="h-64 w-full -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByEvent} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#818cf8" radius={[8, 8, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-white/30 text-sm">No revenue data yet</p>
            </div>
          )}
        </div>

        {/* Tickets Pie */}
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h2 className="text-base font-semibold text-white/90 mb-6 tracking-wide">Tickets: Sold vs Available</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ticketsPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {ticketsPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {ticketsPieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-white/60">{item.name}: <span className="font-mono font-bold text-white/80">{item.value.toLocaleString()}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Summary Table */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="p-6 pb-2">
          <h2 className="text-base font-semibold text-white/90 tracking-wide">Event Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Event</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Tickets Sold</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Revenue</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Occupancy</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {apiComparison.map(event => (
                <tr key={event.event_id} className="hover:bg-white/[0.03] transition-colors duration-300">
                  <td className="p-5 font-semibold text-sm text-white/90">{event.title}</td>
                  <td className="p-5 font-mono text-sm text-white/70">{event.tickets_sold.toLocaleString()}</td>
                  <td className="p-5 font-mono text-sm text-indigo-300">$ {event.total_revenue.toLocaleString()}</td>
                  <td className="p-5">
                    <div className="flex items-center gap-3 max-w-[120px]">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${event.occupancy_rate >= 90 ? 'bg-rose-400' : event.occupancy_rate >= 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${Math.min(event.occupancy_rate, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-white/50">{event.occupancy_rate}%</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                      event.status === 'active' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                      'bg-white/5 text-white/50 border-white/10'
                    }`}>{event.status}</span>
                  </td>
                </tr>
              ))}
              {apiComparison.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-white/10 mb-3 block">analytics</span>
                    <p className="text-sm text-white/30">{loading ? 'Loading...' : 'No event data available. Enroll to events to see analytics.'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
