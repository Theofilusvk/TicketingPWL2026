import { useState, useEffect } from 'react'
import { useStore } from '../../lib/store'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export function AdminDashboardPage() {
  const { orderHistory, ownedTickets, users, events } = useStore()
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Derive real metrics from store + baselines for the aesthetic
  const [metrics, setMetrics] = useState({
    totalRevenue: orderHistory.reduce((acc, o) => acc + o.total, 145200),
    ticketsSold: ownedTickets.length + 3450,
    activeUsers: users.length + 890,
    supportTickets: 12
  })

  // Jitter for active users and live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalRevenue: orderHistory.reduce((acc, o) => acc + o.total, 145200),
        ticketsSold: ownedTickets.length + 3450,
        activeUsers: users.length + 890 + Math.floor(Math.random() * 5) - 2
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [orderHistory, ownedTickets, users])

  const chartData = [
    { name: 'Mon', revenue: 45000 },
    { name: 'Tue', revenue: 60000 },
    { name: 'Wed', revenue: 35000 },
    { name: 'Thu', revenue: 80000 },
    { name: 'Fri', revenue: 50000 },
    { name: 'Sat', revenue: 105000 },
    { name: 'Today', revenue: Math.max(120000, metrics.totalRevenue) },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-white font-mono font-bold text-lg">
            CRD {payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('Vortex Platform Report', 14, 22)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
    doc.setFontSize(12)
    doc.text(`Total Revenue: CRD ${metrics.totalRevenue.toLocaleString()}`, 14, 42)
    doc.text(`Tickets Sold: ${metrics.ticketsSold.toLocaleString()}`, 14, 50)
    doc.text(`Active Users: ${metrics.activeUsers.toLocaleString()}`, 14, 58)
    doc.text(`Support Alerts: ${metrics.supportTickets}`, 14, 66)
    doc.setFontSize(14)
    doc.text('Event Summary', 14, 82)
    const tableData = events.map(e => [
      e.name, e.category || 'N/A', e.date, e.venue,
      `${e.capacity - e.ticketsLeft}/${e.capacity}`,
      `CRD ${((e.capacity - e.ticketsLeft) * e.price).toLocaleString()}`,
      e.status
    ])
    autoTable(doc, {
      startY: 88,
      head: [['Event', 'Category', 'Date', 'Venue', 'Tickets Sold', 'Revenue', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    })
    doc.save('vortex-report.pdf')
    setShowExportMenu(false)
  }

  const handleExportExcel = () => {
    const eventsData = events.map(e => ({
      'Event Name': e.name,
      'Category': e.category || 'N/A',
      'Date': e.date,
      'Venue': e.venue,
      'Capacity': e.capacity,
      'Tickets Left': e.ticketsLeft,
      'Tickets Sold': e.capacity - e.ticketsLeft,
      'Price': e.price,
      'Revenue': (e.capacity - e.ticketsLeft) * e.price,
      'Status': e.status,
    }))
    const ordersData = orderHistory.map(o => ({
      'Order ID': o.id,
      'Date': new Date(o.date).toLocaleString(),
      'Items': o.items.map(i => i.title).join(', '),
      'Total': o.total,
      'Credits Earned': o.creditsEarned,
    }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(eventsData), 'Events')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ordersData), 'Orders')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
      'Total Revenue': metrics.totalRevenue,
      'Tickets Sold': metrics.ticketsSold,
      'Active Users': metrics.activeUsers,
      'Support Alerts': metrics.supportTickets,
    }]), 'Summary')
    XLSX.writeFile(wb, 'vortex-report.xlsx')
    setShowExportMenu(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out z-10 relative pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">System Overview</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">Global platform metrics and status</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-semibold tracking-wide text-sm px-6 py-3 rounded-2xl transition-all duration-300 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_-8px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-2 group"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Report
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-black/80 backdrop-blur-xl border border-white/[0.15] rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-50">
              <button
                onClick={handleExportPDF}
                className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-[18px] text-rose-400">picture_as_pdf</span>
                Export as PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3 border-t border-white/[0.05]"
              >
                <span className="material-symbols-outlined text-[18px] text-emerald-400">table_view</span>
                Export as Excel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `${metrics.totalRevenue.toLocaleString()}`, icon: 'payments', color: 'text-indigo-300', bg: 'bg-indigo-500/20', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]' },
          { label: 'Tickets Issued', value: metrics.ticketsSold.toLocaleString(), icon: 'confirmation_number', color: 'text-sky-300', bg: 'bg-sky-500/20', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.2)]' },
          { label: 'Active Connections', value: metrics.activeUsers.toLocaleString(), icon: 'podcasts', color: 'text-emerald-300', bg: 'bg-emerald-500/20', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.2)]' },
          { label: 'Support Alerts', value: metrics.supportTickets, icon: 'warning', color: 'text-rose-300', bg: 'bg-rose-500/20', glow: 'shadow-[0_0_20px_rgba(251,113,133,0.2)]' },
        ].map(stat => (
          <div key={stat.label} className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-6 rounded-[32px] flex flex-col gap-4 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] hover:bg-white/[0.05] hover:scale-[1.02] transition-all duration-500 ease-out group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex justify-between items-start relative z-10">
              <div className={`w-12 h-12 rounded-[20px] ${stat.bg} ${stat.glow} flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-transform duration-500 group-hover:scale-110`}>
                <span className={`material-symbols-outlined text-[24px] ${stat.color}`}>{stat.icon}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 backdrop-blur-md">+2.4%</span>
            </div>
            <div className="relative z-10 pt-2">
              <p className="font-mono text-3xl font-semibold text-white tracking-tight drop-shadow-sm">{stat.label === 'Total Revenue' ? 'CRD ' : ''}{stat.value}</p>
              <p className="text-sm font-medium text-white/50 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h2 className="text-base font-semibold text-white/90 mb-8 tracking-wide">Revenue Stream (7 Days)</h2>
          
          <div className="h-72 w-full mt-4 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value / 1000}k`}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#818cf8" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h2 className="text-base font-semibold text-white/90 mb-8 tracking-wide">Live Activity Log</h2>
          <div className="space-y-6">
            {[
              { time: 'Just now', text: `New user account verified`, icon: 'person_add', colorClasses: 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]' },
              { time: '2m ago', text: `Ticket checkout for VOID_ZERO completed`, icon: 'confirmation_number', colorClasses: 'bg-sky-500/20 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]' },
              { time: '12m ago', text: `Merchandise drop stock depleted by 5%`, icon: 'sell', colorClasses: 'bg-indigo-500/20 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]' },
              { time: '1h ago', text: `News broadcast published globally`, icon: 'campaign', colorClasses: 'bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]' },
              { time: '2h ago', text: 'System diagnostics routine stable', icon: 'memory', colorClasses: 'bg-zinc-500/20 border-zinc-400 shadow-[0_0_12px_rgba(161,161,170,0.6)]' }
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-4 group cursor-default">
                <div className={`w-3 h-3 rounded-full border mt-1.5 shrink-0 group-hover:scale-125 transition-transform duration-300 ${log.colorClasses}`} />
                <div>
                  <p className="text-sm font-medium text-white/80">{log.text}</p>
                  <span className="text-xs font-medium text-white/40">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
