import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'

type ViewMode = 'detail' | 'summary'

/* ── API response types ── */
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
  payment_method_breakdown: { method: string; gateway: string; total_amount: string; total_transactions: number }[]
}

export function AdminAnalyticsPage() {
  const { events } = useStore()

  // Filter state
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('detail')
  const [showEventSelector, setShowEventSelector] = useState(false)

  // API data state
  const [apiComparison, setApiComparison] = useState<ApiEventComparison[]>([])
  const [apiRevenue, setApiRevenue] = useState<ApiRevenue | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch data from backend
  useEffect(() => {
    const token = localStorage.getItem('vortex.auth.token') || localStorage.getItem('auth_token')

    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const params = new URLSearchParams()
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)

    setLoading(true)

    Promise.all([
      fetch(`/api/admin/analytics/event-comparison?${params}`, { headers }).then(r => r.json()),
      fetch(`/api/admin/analytics/revenue?${params}`, { headers }).then(r => r.json()),
    ])
      .then(([compRes, revRes]) => {
        if (compRes.status === 'success') setApiComparison(compRes.data)
        if (revRes.status === 'success') setApiRevenue(revRes.data)
      })
      .catch(err => console.error('Analytics API error:', err))
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo])

  // Merge API data with store events for filtering
  const filteredApiEvents = useMemo(() => {
    let result = apiComparison
    if (selectedEvents.length > 0) {
      result = result.filter(e => selectedEvents.includes(String(e.event_id)))
    }
    return result
  }, [apiComparison, selectedEvents])

  // Metrics from real API data
  const metrics = useMemo(() => {
    if (filteredApiEvents.length > 0 && selectedEvents.length > 0) {
      // Filtered by specific events
      const totalRevenue = filteredApiEvents.reduce((acc, e) => acc + e.total_revenue, 0)
      const ticketsSold = filteredApiEvents.reduce((acc, e) => acc + e.tickets_sold, 0)
      const totalCapacity = filteredApiEvents.reduce((acc, e) => acc + e.total_capacity, 0)
      const avgTicketPrice = ticketsSold > 0 ? Math.round(totalRevenue / ticketsSold) : 0
      const occupancyRate = totalCapacity > 0 ? Math.round((ticketsSold / totalCapacity) * 100) : 0
      return { totalRevenue, ticketsSold, avgTicketPrice, occupancyRate, totalCapacity }
    }
    // Use full summary from revenue API
    if (apiRevenue) {
      const totalRevenue = apiRevenue.summary.total_revenue
      const totalOrders = apiRevenue.summary.total_orders
      const ticketsSold = apiComparison.reduce((acc, e) => acc + e.tickets_sold, 0)
      const totalCapacity = apiComparison.reduce((acc, e) => acc + e.total_capacity, 0)
      const avgTicketPrice = ticketsSold > 0 ? Math.round(totalRevenue / ticketsSold) : 0
      const occupancyRate = totalCapacity > 0 ? Math.round((ticketsSold / totalCapacity) * 100) : 0
      return { totalRevenue, ticketsSold, avgTicketPrice, occupancyRate, totalCapacity, totalOrders }
    }
    return { totalRevenue: 0, ticketsSold: 0, avgTicketPrice: 0, occupancyRate: 0, totalCapacity: 0 }
  }, [filteredApiEvents, apiRevenue, apiComparison, selectedEvents])

  // Revenue by event (bar chart) — from API
  const revenueByEvent = useMemo(() => {
    return filteredApiEvents
      .filter(e => e.total_revenue > 0)
      .map(e => ({
        name: e.title.length > 14 ? e.title.slice(0, 14) + '…' : e.title,
        fullName: e.title,
        revenue: e.total_revenue,
        ticketsSold: e.tickets_sold,
        occupancy: e.occupancy_rate,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredApiEvents])

  // Tickets sold vs available (pie chart) — from API
  const ticketsPieData = useMemo(() => {
    const totalSold = filteredApiEvents.reduce((acc, e) => acc + e.tickets_sold, 0)
    const totalAvailable = filteredApiEvents.reduce((acc, e) => acc + (e.total_capacity - e.tickets_sold), 0)
    return [
      { name: 'Sold', value: totalSold },
      { name: 'Available', value: totalAvailable > 0 ? totalAvailable : 0 },
    ]
  }, [filteredApiEvents])

  // Event performance comparison (line chart) — from API trend data
  const performanceComparison = useMemo(() => {
    const monthMap: Record<string, any> = {}
    filteredApiEvents.slice(0, 5).forEach(event => {
      event.trend.forEach(t => {
        if (!monthMap[t.month]) monthMap[t.month] = { month: t.month }
        monthMap[t.month][event.title] = t.monthly_revenue
      })
    })
    return Object.values(monthMap).sort((a: any, b: any) => a.month.localeCompare(b.month))
  }, [filteredApiEvents])

  // Trending events (top 5 by occupancy) — from API
  const trendingEvents = useMemo(() => {
    return [...filteredApiEvents]
      .map(e => ({
        id: String(e.event_id),
        name: e.title,
        occupancy: e.occupancy_rate,
        revenue: e.total_revenue,
        sold: e.tickets_sold,
        // Try to get image from store events
        image: events.find(ev => ev.name === e.title || ev.id === String(e.event_id))?.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=400',
        status: e.status?.toUpperCase() || 'ACTIVE',
        category: events.find(ev => ev.name === e.title)?.category || 'Event',
      }))
      .sort((a, b) => b.occupancy - a.occupancy)
      .slice(0, 5)
  }, [filteredApiEvents, events])

  // Event list for filter selector — combine store events + API events
  const eventList = useMemo(() => {
    const apiEventList = apiComparison.map(e => ({ id: String(e.event_id), name: e.title }))
    // Merge: prioritize API list
    if (apiEventList.length > 0) return apiEventList
    return events.map(e => ({ id: e.id, name: e.name }))
  }, [apiComparison, events])

  const toggleEventSelection = (id: string) => {
    setSelectedEvents(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

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
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Event Performance</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">Analytics dashboard for event metrics and revenue insights</p>
          {loading && <p className="text-xs text-indigo-400 mt-1 animate-pulse">Loading live data from server...</p>}
        </div>
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white/[0.05] rounded-2xl p-1 border border-white/[0.08]">
          {(['detail', 'summary'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                viewMode === mode
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[24px] p-5 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex flex-col lg:flex-row gap-4 items-end">
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

          {/* Event Multi-Select */}
          <div className="relative">
            <button
              onClick={() => setShowEventSelector(!showEventSelector)}
              className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.08] transition-all flex items-center gap-2 min-w-[180px]"
            >
              <span className="material-symbols-outlined text-[16px] text-white/40">filter_list</span>
              {selectedEvents.length === 0 ? 'All Events' : `${selectedEvents.length} selected`}
            </button>
            {showEventSelector && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-black/90 backdrop-blur-xl border border-white/[0.15] rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <button onClick={() => { setSelectedEvents([]); setShowEventSelector(false) }} className="w-full px-3 py-2 text-left text-xs text-indigo-300 hover:bg-white/10 rounded-xl transition-colors font-semibold">
                    Clear All Filters
                  </button>
                </div>
                {eventList.map(event => (
                  <button
                    key={event.id}
                    onClick={() => toggleEventSelection(event.id)}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-3 border-t border-white/[0.04] ${
                      selectedEvents.includes(event.id) ? 'text-white' : 'text-white/50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                      selectedEvents.includes(event.id) ? 'bg-indigo-500 border-indigo-400' : 'border-white/20'
                    }`}>
                      {selectedEvents.includes(event.id) && <span className="material-symbols-outlined text-[12px] text-white">check</span>}
                    </div>
                    <span className="truncate">{event.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset */}
          {(dateFrom || dateTo || selectedEvents.length > 0) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setSelectedEvents([]) }}
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
          { label: 'Total Revenue', value: `$ ${metrics.totalRevenue.toLocaleString()}`, icon: 'payments', color: 'text-indigo-300', bg: 'bg-indigo-500/20', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]', change: apiRevenue ? `${apiRevenue.summary.total_orders} orders` : '...' },
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

      {viewMode === 'detail' ? (
        <>
          {/* Line Chart: Event Performance Comparison */}
          <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <h2 className="text-base font-semibold text-white/90 mb-6 tracking-wide">Event Performance Comparison</h2>
            <div className="h-72 w-full -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceComparison} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }} />
                  {filteredApiEvents.slice(0, 5).map((event, i) => (
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
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#818cf8" radius={[8, 8, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tickets Sold vs Available (Pie) */}
            <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <h2 className="text-base font-semibold text-white/90 mb-6 tracking-wide">Tickets: Sold vs Available</h2>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketsPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
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
        </>
      ) : (
        /* Summary View */
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
                  <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Refund Rate</th>
                  <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredApiEvents.map(event => (
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
                    <td className="p-5 font-mono text-sm text-white/50">{event.refund_rate}%</td>
                    <td className="p-5">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                        event.status === 'active' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                        event.status === 'canceled' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' :
                        'bg-white/5 text-white/50 border-white/10'
                      }`}>{event.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trending Events (Top 5) */}
      <div>
        <h2 className="text-lg font-semibold text-white/90 mb-4 tracking-wide flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-[22px]">trending_up</span>
          Trending Events (Top 5)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {trendingEvents.map((event, i) => (
            <div key={event.id} className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[24px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] hover:bg-white/[0.05] hover:scale-[1.02] transition-all duration-500 group relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              {/* Rank Badge */}
              <div className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center">
                <span className="text-[11px] font-bold text-white/80">#{i + 1}</span>
              </div>
              {/* Image */}
              <div className="h-24 relative overflow-hidden">
                <img src={event.image} alt={event.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              {/* Content */}
              <div className="p-4">
                <p className="text-sm font-semibold text-white/90 truncate">{event.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-mono text-xs text-indigo-300">$ {event.revenue.toLocaleString()}</span>
                  <span className={`font-mono text-xs font-bold ${event.occupancy >= 80 ? 'text-rose-400' : event.occupancy >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {event.occupancy}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      event.occupancy >= 80 ? 'bg-gradient-to-r from-rose-500 to-pink-500' :
                      event.occupancy >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                      'bg-gradient-to-r from-emerald-500 to-green-500'
                    }`}
                    style={{ width: `${Math.min(event.occupancy, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {trendingEvents.length === 0 && (
            <div className="col-span-5 text-center py-12">
              <p className="text-sm text-white/30">{loading ? 'Loading...' : 'No events match current filters'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
