import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'

type ViewMode = 'detail' | 'summary'

export function AdminAnalyticsPage() {
  const { events, orderHistory, ownedTickets } = useStore()

  // Filter state
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('detail')
  const [showEventSelector, setShowEventSelector] = useState(false)

  // Filtered events
  const filteredEvents = useMemo(() => {
    let result = events
    if (selectedEvents.length > 0) {
      result = result.filter(e => selectedEvents.includes(e.id))
    }
    if (dateFrom) {
      result = result.filter(e => {
        const d = e.date.replace(/_/g, '-')
        return d >= dateFrom
      })
    }
    if (dateTo) {
      result = result.filter(e => {
        const d = e.date.replace(/_/g, '-')
        return d <= dateTo
      })
    }
    return result
  }, [events, selectedEvents, dateFrom, dateTo])

  // Metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredEvents.reduce((acc, e) => acc + (e.capacity - e.ticketsLeft) * e.price, 0) + (selectedEvents.length === 0 ? orderHistory.reduce((acc, o) => acc + o.total, 145200) : 0)
    const ticketsSold = filteredEvents.reduce((acc, e) => acc + (e.capacity - e.ticketsLeft), 0) + (selectedEvents.length === 0 ? ownedTickets.length + 3450 : 0)
    const totalCapacity = filteredEvents.reduce((acc, e) => acc + e.capacity, 0)
    const avgTicketPrice = ticketsSold > 0 ? Math.round(totalRevenue / ticketsSold) : 0
    const occupancyRate = totalCapacity > 0 ? Math.round((ticketsSold / totalCapacity) * 100) : 0
    return { totalRevenue, ticketsSold, avgTicketPrice, occupancyRate, totalCapacity }
  }, [filteredEvents, orderHistory, ownedTickets, selectedEvents])

  // Revenue by event (bar chart)
  const revenueByEvent = useMemo(() => {
    return filteredEvents
      .map(e => ({
        name: e.name.length > 14 ? e.name.slice(0, 14) + '…' : e.name,
        fullName: e.name,
        revenue: (e.capacity - e.ticketsLeft) * e.price,
        ticketsSold: e.capacity - e.ticketsLeft,
        occupancy: Math.round(((e.capacity - e.ticketsLeft) / e.capacity) * 100),
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredEvents])

  // Tickets sold vs available (pie chart)
  const ticketsPieData = useMemo(() => {
    const totalSold = filteredEvents.reduce((acc, e) => acc + (e.capacity - e.ticketsLeft), 0)
    const totalAvailable = filteredEvents.reduce((acc, e) => acc + e.ticketsLeft, 0)
    return [
      { name: 'Sold', value: totalSold },
      { name: 'Available', value: totalAvailable },
    ]
  }, [filteredEvents])

  // Event performance comparison (line chart) - simulated monthly data
  const performanceComparison = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, i) => {
      const entry: any = { month }
      filteredEvents.slice(0, 5).forEach((event, j) => {
        const baseSold = event.capacity - event.ticketsLeft
        const factor = Math.sin((i + j) * 0.8) * 0.3 + 0.5
        entry[event.name] = Math.round(baseSold * factor * event.price)
      })
      return entry
    })
  }, [filteredEvents])

  // Trending events (top 5 by occupancy)
  const trendingEvents = useMemo(() => {
    return [...filteredEvents]
      .map(e => ({
        ...e,
        sold: e.capacity - e.ticketsLeft,
        occupancy: Math.round(((e.capacity - e.ticketsLeft) / e.capacity) * 100),
        revenue: (e.capacity - e.ticketsLeft) * e.price,
      }))
      .sort((a, b) => b.occupancy - a.occupancy)
      .slice(0, 5)
  }, [filteredEvents])

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
                {events.map(event => (
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
          { label: 'Total Revenue', value: `CRD ${metrics.totalRevenue.toLocaleString()}`, icon: 'payments', color: 'text-indigo-300', bg: 'bg-indigo-500/20', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]', change: '+12.5%' },
          { label: 'Tickets Sold', value: metrics.ticketsSold.toLocaleString(), icon: 'confirmation_number', color: 'text-sky-300', bg: 'bg-sky-500/20', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.2)]', change: '+8.2%' },
          { label: 'Avg Ticket Price', value: `CRD ${metrics.avgTicketPrice.toLocaleString()}`, icon: 'trending_up', color: 'text-emerald-300', bg: 'bg-emerald-500/20', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.2)]', change: '+3.1%' },
          { label: 'Occupancy Rate', value: `${metrics.occupancyRate}%`, icon: 'donut_large', color: 'text-amber-300', bg: 'bg-amber-500/20', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.2)]', change: '+1.8%' },
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
                  {filteredEvents.slice(0, 5).map((event, i) => (
                    <Line
                      key={event.id}
                      type="monotone"
                      dataKey={event.name}
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
                  <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Category</th>
                  <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Tickets Sold</th>
                  <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Revenue</th>
                  <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Occupancy</th>
                  <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredEvents.map(event => {
                  const sold = event.capacity - event.ticketsLeft
                  const occ = Math.round((sold / event.capacity) * 100)
                  const rev = sold * event.price
                  return (
                    <tr key={event.id} className="hover:bg-white/[0.03] transition-colors duration-300">
                      <td className="p-5 font-semibold text-sm text-white/90">{event.name}</td>
                      <td className="p-5">
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border bg-white/5 text-white/60 border-white/10">{event.category}</span>
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
                  <span className="font-mono text-xs text-indigo-300">CRD {event.revenue.toLocaleString()}</span>
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
                    style={{ width: `${event.occupancy}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {trendingEvents.length === 0 && (
            <div className="col-span-5 text-center py-12">
              <p className="text-sm text-white/30">No events match current filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
