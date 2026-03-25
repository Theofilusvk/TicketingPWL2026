import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useAudio } from '../lib/audio'

function generateQRPattern(seed: string) {
  const hash = seed.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  const cells: boolean[][] = []
  for (let i = 0; i < 21; i++) {
    cells.push([])
    for (let j = 0; j < 21; j++) {
      // Fixed patterns for QR-like corners
      const isCorner =
        (i < 7 && j < 7) || (i < 7 && j > 13) || (i > 13 && j < 7)
      const isBorder =
        (i === 0 || i === 6 || j === 0 || j === 6) && i < 7 && j < 7 ||
        (i === 0 || i === 6 || j === 14 || j === 20) && i < 7 && j > 13 ||
        (i === 14 || i === 20 || j === 0 || j === 6) && i > 13 && j < 7
      const isInner =
        (i >= 2 && i <= 4 && j >= 2 && j <= 4) ||
        (i >= 2 && i <= 4 && j >= 16 && j <= 18) ||
        (i >= 16 && i <= 18 && j >= 2 && j <= 4)
      if (isCorner) {
        cells[i].push(isBorder || isInner)
      } else {
        cells[i].push(((hash * (i + 1) * (j + 1)) & 0xff) > 120)
      }
    }
  }
  return cells
}

export function HistoryPage() {
  const { orderHistory } = useStore()
  const { playClickSound, playHoverSound } = useAudio()
  const [receiptOrder, setReceiptOrder] = useState<string | null>(null)

  const selectedOrder = orderHistory.find(o => o.id === receiptOrder)

  return (
    <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 mb-20 space-y-10">
      {/* Header */}
      <section className="reveal">
        <h1 className="font-display text-6xl md:text-8xl text-primary leading-none mb-4">ORDER_LOG</h1>
        <p className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">
          / COMPLETE TRANSACTION ARCHIVE — ALL EXECUTED PROTOCOLS
        </p>
      </section>

      {/* Stats Bar */}
      <section className="reveal grid grid-cols-1 sm:grid-cols-3 gap-0 border border-white/10">
        <div className="p-6 flex justify-between items-center border-b sm:border-b-0 sm:border-r border-white/10">
          <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">TOTAL_ORDERS</span>
          <span className="font-display text-3xl text-white">{orderHistory.length}</span>
        </div>
        <div className="p-6 flex justify-between items-center border-b sm:border-b-0 sm:border-r border-white/10">
          <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">TOTAL_SPENT</span>
          <span className="font-display text-3xl text-primary">
            {orderHistory.reduce((acc, o) => acc + o.total, 0).toFixed(2)}
          </span>
        </div>
        <div className="p-6 flex justify-between items-center">
          <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">CREDITS_EARNED</span>
          <span className="font-display text-3xl text-hot-coral">
            {orderHistory.reduce((acc, o) => acc + o.creditsEarned, 0).toLocaleString()}
          </span>
        </div>
      </section>

      {/* Order List */}
      <section className="reveal space-y-4">
        {orderHistory.length > 0 ? (
          orderHistory.slice().reverse().map((order, idx) => (
            <div key={order.id} className="border border-zinc-800 bg-black/40 hover:border-primary/30 transition-colors">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-zinc-800 gap-4">
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl text-zinc-700">
                    {String(orderHistory.length - idx).padStart(3, '0')}
                  </span>
                  <div>
                    <p className="font-mono text-xs text-white">{order.id}</p>
                    <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest">
                      {new Date(order.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-accent text-[8px] text-primary uppercase tracking-widest font-bold bg-primary/10 px-3 py-1">
                    +{order.creditsEarned.toLocaleString()} CRD
                  </span>
                  <span className="font-display text-xl text-white">{order.total.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Order Items + Receipt Button */}
              <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-2 flex-1">
                  {order.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex justify-between items-center font-accent text-[10px] uppercase tracking-widest">
                      <span className="text-zinc-400">{item.title}</span>
                      <span className="text-white">{item.price.toFixed(2)} USD</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { playClickSound(); setReceiptOrder(order.id) }}
                  onMouseEnter={playHoverSound}
                  className="shrink-0 border border-primary/50 text-primary px-4 py-2 font-accent text-[10px] uppercase tracking-widest hover:bg-primary hover:text-black transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">qr_code</span>
                  VIEW_RECEIPT
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="border border-zinc-800 bg-black/40 p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-zinc-700 mb-4 block">receipt_long</span>
            <h3 className="font-display text-3xl text-zinc-500 mb-2">NO_RECORDS</h3>
            <p className="font-accent text-[10px] text-zinc-600 uppercase tracking-widest mb-8">
              Your transaction archive is empty. Complete your first purchase to begin logging.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 font-accent text-xs uppercase tracking-widest hover:bg-primary hover:text-black transition-colors"
            >
              <span className="material-symbols-outlined text-sm">explore</span>
              BROWSE EVENTS
            </Link>
          </div>
        )}
      </section>

      {/* Holographic Receipt Modal */}
      {receiptOrder && selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setReceiptOrder(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md border-2 border-primary bg-gradient-to-b from-zinc-950 to-black p-8 animate-in zoom-in-95 fade-in duration-300"
            onClick={e => e.stopPropagation()}
            style={{
              boxShadow: '0 0 40px rgba(203,255,0,0.15), inset 0 0 60px rgba(203,255,0,0.03)',
            }}
          >
            {/* Scanner line effect */}
            <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" style={{ top: '50%' }} />

            {/* Logo */}
            <div className="text-center mb-6">
              <span className="material-symbols-outlined text-primary text-4xl mb-2 block drop-shadow-[0_0_10px_#CBFF00]">cyclone</span>
              <h2 className="font-display text-3xl text-primary tracking-widest">VORTEX</h2>
              <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mt-1">DIGITAL_RECEIPT // PROOF_OF_PURCHASE</p>
            </div>

            <div className="border-t border-dashed border-white/20 my-4" />

            {/* Receipt details */}
            <div className="space-y-3 font-accent text-[10px] uppercase tracking-widest">
              <div className="flex justify-between">
                <span className="text-zinc-500">TX_ID</span>
                <span className="text-white font-mono text-[9px]">{selectedOrder.id.slice(0, 20)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">TIMESTAMP</span>
                <span className="text-white">{new Date(selectedOrder.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">STATUS</span>
                <span className="text-primary font-bold">CONFIRMED ✓</span>
              </div>
            </div>

            <div className="border-t border-dashed border-white/20 my-4" />

            {/* Items */}
            <div className="space-y-2 mb-4">
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between font-accent text-[10px] uppercase tracking-widest">
                  <span className="text-zinc-400">{item.title}</span>
                  <span className="text-white">{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/20 my-4" />
            <div className="flex justify-between font-accent text-xs uppercase tracking-widest font-bold">
              <span className="text-white">TOTAL</span>
              <span className="text-primary">{selectedOrder.total.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between font-accent text-[10px] uppercase tracking-widest mt-2">
              <span className="text-zinc-500">CREDITS_EARNED</span>
              <span className="text-hot-coral">+{selectedOrder.creditsEarned.toLocaleString()} CRD</span>
            </div>

            <div className="border-t border-dashed border-white/20 my-6" />

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="p-2 bg-white">
                <svg viewBox="0 0 21 21" width="120" height="120">
                  {generateQRPattern(selectedOrder.id).map((row, i) =>
                    row.map((filled, j) =>
                      filled ? (
                        <rect key={`${i}-${j}`} x={j} y={i} width={1} height={1} fill="black" />
                      ) : null
                    )
                  )}
                </svg>
              </div>
            </div>
            <p className="text-center font-accent text-[8px] text-zinc-600 uppercase tracking-widest">
              SCAN TO VERIFY AUTHENTICITY ON VORTEX CHAIN
            </p>

            {/* Close */}
            <button
              onClick={() => setReceiptOrder(null)}
              className="w-full mt-6 py-3 border border-zinc-700 text-zinc-400 font-accent text-[10px] uppercase tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all"
            >
              CLOSE_RECEIPT
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
