import { useState, useMemo, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

type ReportType = 'transaction' | 'daily-revenue' | 'event-profit' | 'refund'

const REPORT_TABS: { key: ReportType; label: string; icon: string; description: string }[] = [
  { key: 'transaction', label: 'Transactions', icon: 'receipt_long', description: 'All transactions filtered by event and date range' },
  { key: 'daily-revenue', label: 'Daily Revenue', icon: 'trending_up', description: 'Aggregate revenue per day across all events' },
  { key: 'event-profit', label: 'Event Profit', icon: 'analytics', description: 'Revenue and profit breakdown per event' },
  { key: 'refund', label: 'Refunds', icon: 'undo', description: 'Refund and cancellation log' },
]

export function AdminReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('transaction')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedEventFilter, setSelectedEventFilter] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // API Data States
  const [apiTransactions, setApiTransactions] = useState<any[]>([])
  const [apiDailyRevenue, setApiDailyRevenue] = useState<any[]>([])
  const [apiEventComparison, setApiEventComparison] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Dropdown options
  const eventOptions = useMemo(() => {
    return apiEventComparison.map(e => e.title)
  }, [apiEventComparison])

  useEffect(() => {
    const token = localStorage.getItem('vortex.auth.token') || localStorage.getItem('auth_token')
    if (!token) return

    const headers: Record<string, string> = { Accept: 'application/json', Authorization: `Bearer ${token}` }
    const params = new URLSearchParams()
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)

    setIsLoading(true)

    Promise.all([
      fetch(`/api/admin/analytics/transactions?${params}`, { headers }).then(r => r.json()),
      fetch(`/api/admin/analytics/revenue?${params}`, { headers }).then(r => r.json()),
      fetch(`/api/admin/analytics/event-comparison?${params}`, { headers }).then(r => r.json())
    ])
    .then(([transactionsRes, revenueRes, compRes]) => {
      if (transactionsRes.status === 'success') {
        const txs = transactionsRes.data.recent_transactions || []
        // Optional: you can manually filter transactions beyond limit in a real large application by passing page sizes 
        setApiTransactions(txs)
      }
      if (revenueRes.status === 'success') {
        setApiDailyRevenue(revenueRes.data.daily_revenue || [])
      }
      if (compRes.status === 'success') {
        setApiEventComparison(compRes.data || [])
      }
    })
    .catch(err => console.error('Reports API Error:', err))
    .finally(() => setIsLoading(false))

  }, [dateFrom, dateTo]) // Re-fetch when date filter changes

  // ==================== DATA GENERATORS ====================

  // Transaction Report
  const transactionData = useMemo(() => {
    let data = apiTransactions.map(t => ({
      orderId: t.order_id,
      date: new Date(t.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
      rawDate: t.created_at,
      items: t.event_title || 'N/A',
      itemCount: 1, // Simplified as we aggregate
      total: parseFloat(t.total_price),
      credits: Math.round(parseFloat(t.total_price) * 0.1), // Mocked credits
      status: t.status === 'paid' ? 'Completed' : t.status === 'pending' ? 'Pending' : t.status === 'refunded' ? 'Refunded' : 'Cancelled',
    }))

    // Apply event filter locally
    if (selectedEventFilter) {
      data = data.filter((d: any) => d.items.toLowerCase().includes(selectedEventFilter.toLowerCase()))
    }

    return data
  }, [apiTransactions, selectedEventFilter])

  // Daily Revenue Report
  const dailyRevenueData = useMemo(() => {
    return apiDailyRevenue.map(d => ({
      date: d.date,
      revenue: parseFloat(d.revenue)
    }))
  }, [apiDailyRevenue])

  // Event Profit Breakdown
  const eventProfitData = useMemo(() => {
    let data = apiEventComparison.map(e => {
      const revenue = parseFloat(e.total_revenue)
      const operationalCost = Math.round(revenue * 0.15)
      const platformFee = Math.round(revenue * 0.08)
      const profit = revenue - operationalCost - platformFee
      return {
        name: e.title,
        category: 'Event',
        ticketsSold: e.tickets_sold,
        capacity: e.total_capacity,
        revenue,
        operationalCost,
        platformFee,
        profit,
        margin: revenue > 0 ? Math.round((profit / revenue) * 100) : 0,
      }
    })

    if (selectedEventFilter) {
      data = data.filter(d => d.name === selectedEventFilter)
    }

    return data.sort((a, b) => b.profit - a.profit)
  }, [apiEventComparison, selectedEventFilter])

  // Refund/Cancellation Report
  const refundData = useMemo(() => {
    return transactionData.filter((t: any) => t.status === 'Refunded' || t.status === 'Cancelled')
  }, [transactionData])

  // ==================== EXPORT FUNCTIONS ====================

  const getActiveTableData = () => {
    switch (activeReport) {
      case 'transaction':
        return { headers: ['Order ID', 'Date', 'Event', 'Total', 'Credits', 'Status'], rows: transactionData.map((t: any) => [t.orderId, t.date, t.items, `$ ${t.total.toLocaleString()}`, t.credits.toString(), t.status]) }
      case 'daily-revenue':
        return { headers: ['Date', 'Revenue'], rows: dailyRevenueData.map(d => [d.date, `$ ${d.revenue.toLocaleString()}`]) }
      case 'event-profit':
        return { headers: ['Event', 'Category', 'Sold', 'Revenue', 'Cost', 'Fee', 'Profit', 'Margin'], rows: eventProfitData.map(e => [e.name, e.category, `${e.ticketsSold}/${e.capacity}`, `$ ${e.revenue.toLocaleString()}`, `$ ${e.operationalCost.toLocaleString()}`, `$ ${e.platformFee.toLocaleString()}`, `$ ${e.profit.toLocaleString()}`, `${e.margin}%`]) }
      case 'refund':
        return { headers: ['Order ID', 'Date', 'Event', 'Amount', 'Status'], rows: refundData.map((r: any) => [r.orderId, r.date, r.items, `$ ${r.total.toLocaleString()}`, r.status]) }
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    const tab = REPORT_TABS.find(t => t.key === activeReport)!
    const data = getActiveTableData()

    doc.setFontSize(20)
    doc.text(`Vortex — ${tab.label} Report`, 14, 22)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
    if (dateFrom || dateTo) {
      doc.text(`Period: ${dateFrom || '—'} to ${dateTo || '—'}`, 14, 36)
    }
    if (selectedEventFilter) {
      doc.text(`Filter: ${selectedEventFilter}`, 14, 42)
    }

    const startY = selectedEventFilter ? 50 : dateFrom || dateTo ? 44 : 38

    autoTable(doc, {
      startY,
      head: [data.headers],
      body: data.rows,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      styles: { cellPadding: 3 },
    })

    // Summary footer
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(9)
    doc.setTextColor(80)
    if (activeReport === 'transaction') {
      const totalRev = transactionData.filter((t: any) => t.status === 'Completed').reduce((acc: number, t: any) => acc + t.total, 0)
      doc.text(`Total Transactions: ${transactionData.length} | Total Revenue: $ ${totalRev.toLocaleString()}`, 14, finalY)
    } else if (activeReport === 'event-profit') {
      const totalProfit = eventProfitData.reduce((acc, e) => acc + e.profit, 0)
      doc.text(`Total Profit: $ ${totalProfit.toLocaleString()}`, 14, finalY)
    }

    doc.save(`vortex-${activeReport}-report.pdf`)
    setShowExportMenu(false)
  }

  const handleExportExcel = () => {
    const data = getActiveTableData()
    const tab = REPORT_TABS.find(t => t.key === activeReport)!

    const worksheetData = data.rows.map(row => {
      const obj: Record<string, string> = {}
      data.headers.forEach((h, i) => { obj[h] = row[i] })
      return obj
    })

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(worksheetData), tab.label)
    XLSX.writeFile(wb, `vortex-${activeReport}-report.xlsx`)
    setShowExportMenu(false)
  }

  const handleEmailExport = async () => {
    if (!emailAddress || !emailAddress.includes('@')) return

    setIsSending(true)
    const data = getActiveTableData()
    const token = localStorage.getItem('vortex.auth.token') || localStorage.getItem('auth_token')

    try {
      const res = await fetch('/api/admin/reports/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: emailAddress,
          report_type: activeReport,
          headers: data.headers,
          rows: data.rows
        })
      })

      if (res.ok) {
        setEmailSent(true)
        setTimeout(() => {
          setEmailSent(false)
          setShowEmailModal(false)
          setEmailAddress('')
        }, 2500)
      } else {
        alert('Failed to send email.')
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setIsSending(false)
    }
  }

  // ==================== RENDER ====================

  const activeTab = REPORT_TABS.find(t => t.key === activeReport)!
  const tableData = getActiveTableData()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out z-10 relative pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Reports</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5 flex items-center gap-2">
            Build custom reports and export data
            {isLoading && <span className="text-indigo-400 animate-pulse">(Connecting to live data...)</span>}
          </p>
        </div>
        {/* Export Button */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-semibold tracking-wide text-sm px-6 py-3 rounded-2xl transition-all duration-300 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_-8px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-2 group"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-black/90 backdrop-blur-xl border border-white/[0.15] rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-50">
              <button
                onClick={handleExportPDF}
                className="w-full px-4 py-3.5 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-[18px] text-rose-400">picture_as_pdf</span>
                Export as PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="w-full px-4 py-3.5 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3 border-t border-white/[0.05]"
              >
                <span className="material-symbols-outlined text-[18px] text-emerald-400">table_view</span>
                Export as Excel
              </button>
              <button
                onClick={() => { setShowExportMenu(false); setShowEmailModal(true) }}
                className="w-full px-4 py-3.5 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3 border-t border-white/[0.05]"
              >
                <span className="material-symbols-outlined text-[18px] text-sky-400">mail</span>
                Send via Email
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-3">
        {REPORT_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveReport(tab.key)}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-sm font-semibold tracking-wide border transition-all duration-300 ${
              activeReport === tab.key
                ? 'bg-white/15 text-white border-white/20 shadow-[0_4px_20px_-4px_rgba(255,255,255,0.1)]'
                : 'bg-white/[0.02] text-white/40 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${activeReport === tab.key ? 'text-indigo-300' : 'text-white/30'}`}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[24px] p-5 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest pl-1">Event Filter</label>
              <select
                value={selectedEventFilter}
                onChange={e => setSelectedEventFilter(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-all [color-scheme:dark] appearance-none cursor-pointer"
              >
                <option value="" className="bg-zinc-900">All Events</option>
                {eventOptions.map((ev, i) => (
                  <option key={i} value={ev} className="bg-zinc-900">{ev}</option>
                ))}
              </select>
            </div>
          </div>
          {(dateFrom || dateTo || selectedEventFilter) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setSelectedEventFilter('') }}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-white/50 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Report Description */}
      <div className="flex items-center gap-3 px-1">
        <span className={`material-symbols-outlined text-indigo-400 text-[20px]`}>{activeTab.icon}</span>
        <div>
          <p className="text-sm font-semibold text-white/90">{activeTab.label} Report</p>
          <p className="text-xs text-white/40">{activeTab.description}</p>
        </div>
        <div className="ml-auto font-mono text-xs text-white/30 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.06]">
          {tableData.rows.length} records
        </div>
      </div>

      {/* Chart Preview for applicable reports */}
      {activeReport === 'daily-revenue' && dailyRevenueData.length > 0 && (
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h2 className="text-base font-semibold text-white/90 mb-6 tracking-wide">Daily Revenue Chart</h2>
          <div className="h-56 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyRevenueData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl text-xs">
                          <p className="text-white/60 font-semibold mb-1">{label}</p>
                          <p className="font-mono font-bold text-indigo-300">$ {payload[0].value.toLocaleString()}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="revenue" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeReport === 'event-profit' && eventProfitData.length > 0 && (
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h2 className="text-base font-semibold text-white/90 mb-6 tracking-wide">Profit Breakdown</h2>
          <div className="h-56 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventProfitData.map(e => ({ name: e.name.length > 12 ? e.name.slice(0, 12) + '…' : e.name, revenue: e.revenue, cost: e.operationalCost, fee: e.platformFee, profit: e.profit }))} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl text-xs">
                          <p className="text-white/60 font-semibold mb-1">{label}</p>
                          {payload.map((p: any, i: number) => (
                            <p key={i} className="font-mono font-bold" style={{ color: p.fill }}>{p.name}: $ {p.value.toLocaleString()}</p>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="revenue" fill="#818cf8" radius={[6, 6, 0, 0]} name="Revenue" stackId="a" />
                <Bar dataKey="profit" fill="#34d399" radius={[6, 6, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {tableData.headers.map(h => (
                  <th key={h} className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {tableData.rows.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors duration-300">
                  {row.map((cell: any, j) => (
                    <td key={j} className={`p-5 text-sm whitespace-nowrap ${
                      j === 0 ? 'font-mono text-white/50 text-xs' :
                      (typeof cell === 'string' && cell.startsWith('$')) ? 'font-mono text-indigo-300' :
                      cell === 'Completed' ? 'text-emerald-400 font-semibold text-xs' :
                      cell === 'Refunded' ? 'text-amber-400 font-semibold text-xs' :
                      cell === 'Cancelled' ? 'text-rose-400 font-semibold text-xs' :
                      (typeof cell === 'string' && cell.endsWith('%')) ? 'font-mono text-white/70' :
                      'text-white/70'
                    }`}>
                      {cell === 'Completed' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />}
                      {cell === 'Refunded' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-2" />}
                      {cell === 'Cancelled' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 mr-2" />}
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              {tableData.rows.length === 0 && (
                <tr>
                  <td colSpan={tableData.headers.length} className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-white/10 mb-3 block">search_off</span>
                    <p className="text-sm text-white/30">{isLoading ? 'Loading live data...' : 'No records match current filters'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      {activeReport === 'transaction' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Transactions', value: transactionData.length.toString(), icon: 'receipt_long', color: 'text-indigo-300', bg: 'bg-indigo-500/20' },
            { label: 'Total Revenue', value: `$ ${transactionData.filter((t: any) => t.status === 'Completed').reduce((acc: number, t: any) => acc + t.total, 0).toLocaleString()}`, icon: 'payments', color: 'text-emerald-300', bg: 'bg-emerald-500/20' },
            { label: 'Credits Distributed', value: transactionData.filter((t: any) => t.status === 'Completed').reduce((acc: number, t: any) => acc + t.credits, 0).toLocaleString(), icon: 'stars', color: 'text-amber-300', bg: 'bg-amber-500/20' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-5 rounded-[24px] flex items-center gap-4 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className={`w-11 h-11 rounded-[16px] ${stat.bg} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[20px] ${stat.color}`}>{stat.icon}</span>
              </div>
              <div>
                <p className="font-mono text-lg font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-white/40 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeReport === 'event-profit' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue', value: `$ ${eventProfitData.reduce((acc, e) => acc + e.revenue, 0).toLocaleString()}`, icon: 'payments', color: 'text-indigo-300', bg: 'bg-indigo-500/20' },
            { label: 'Total Profit', value: `$ ${eventProfitData.reduce((acc, e) => acc + e.profit, 0).toLocaleString()}`, icon: 'trending_up', color: 'text-emerald-300', bg: 'bg-emerald-500/20' },
            { label: 'Avg Margin', value: `${eventProfitData.length > 0 ? Math.round(eventProfitData.reduce((acc, e) => acc + e.margin, 0) / eventProfitData.length) : 0}%`, icon: 'percent', color: 'text-amber-300', bg: 'bg-amber-500/20' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-5 rounded-[24px] flex items-center gap-4 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className={`w-11 h-11 rounded-[16px] ${stat.bg} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[20px] ${stat.color}`}>{stat.icon}</span>
              </div>
              <div>
                <p className="font-mono text-lg font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-white/40 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeReport === 'refund' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Total Refunds', value: refundData.filter((r: any) => r.status === 'Refunded').length.toString(), icon: 'undo', color: 'text-amber-300', bg: 'bg-amber-500/20' },
            { label: 'Total Cancellations', value: refundData.filter((r: any) => r.status === 'Cancelled').length.toString(), icon: 'cancel', color: 'text-rose-300', bg: 'bg-rose-500/20' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-5 rounded-[24px] flex items-center gap-4 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className={`w-11 h-11 rounded-[16px] ${stat.bg} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[20px] ${stat.color}`}>{stat.icon}</span>
              </div>
              <div>
                <p className="font-mono text-lg font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-white/40 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Email Export Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => { if (!isSending) { setShowEmailModal(false); setEmailAddress(''); setEmailSent(false) } }}>
          <div className="bg-black/70 backdrop-blur-[60px] border border-white/[0.15] rounded-[32px] w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {isSending ? (
              /* Sending Animation */
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-sky-400 animate-spin mx-auto mb-5" />
                <h3 className="text-lg font-semibold text-white mb-1">Sending Report...</h3>
                <p className="text-sm text-white/40">Delivering to <span className="text-sky-300 font-mono">{emailAddress}</span></p>
              </div>
            ) : emailSent ? (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-500">
                  <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Report Sent!</h3>
                <p className="text-sm text-white/50">Successfully sent to <span className="text-emerald-300 font-mono">{emailAddress}</span></p>
                <div className="mt-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">attach_email</span>
                  <span className="text-xs text-white/50">vortex-{activeReport}-report.pdf</span>
                </div>
              </div>
            ) : (
              /* Form State */
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-[16px] bg-sky-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px] text-sky-300">forward_to_inbox</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Send Report via Email</h3>
                    <p className="text-xs text-white/40">Report will be generated and sent as PDF attachment</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Recipient Email</label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={e => setEmailAddress(e.target.value)}
                      placeholder="admin@vortex.com"
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 placeholder:text-white/20"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleEmailExport() }}
                    />
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                    <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Report Details</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Type</span>
                        <span className="text-white/70 font-medium">{activeTab.label}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Records</span>
                        <span className="text-white/70 font-mono">{tableData.rows.length}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Format</span>
                        <span className="text-white/70">PDF Attachment</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setShowEmailModal(false); setEmailAddress('') }}
                      className="flex-1 px-4 py-3.5 rounded-2xl border border-white/[0.1] text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.03] transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEmailExport}
                      disabled={!emailAddress || !emailAddress.includes('@')}
                      className="flex-1 px-4 py-3.5 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Send Report
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
