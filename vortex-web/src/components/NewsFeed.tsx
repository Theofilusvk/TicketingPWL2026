import { useStore } from '../lib/store'

export function NewsFeed() {
  const { news } = useStore()

  return (
    <div className="flex flex-col gap-4">
      <div className="border-[3px] border-primary p-6">
        <h2 className="font-display text-4xl text-primary mb-8 inline-block border-b-4 border-primary pb-1">
          NEWS_FEED
        </h2>
        
        <div className="space-y-8">
          {news.map((item, i) => (
            <div key={i} className="flex flex-col gap-2 relative">
              <div className="flex justify-between items-center">
                <span className="font-accent text-[8px] text-zinc-500">{item.date}</span>
                <span className={`font-accent text-[8px] px-2 py-0.5 font-bold tracking-widest ${item.tagColor}`}>
                  {item.tag}
                </span>
              </div>
              <h3 className="font-display text-2xl text-white">{item.title}</h3>
              <p className="font-accent text-[10px] text-zinc-400 leading-relaxed max-w-sm">
                {item.content}
              </p>
            </div>
          ))}
        </div>

        <button className="w-full mt-8 border border-primary text-primary hover:bg-primary hover:text-black transition-colors py-3 font-accent font-bold text-[10px] uppercase tracking-widest">
          VIEW ALL UPDATES
        </button>
      </div>

      <div className="bg-hot-coral p-4 text-black font-accent text-[10px] tracking-widest font-bold uppercase leading-snug">
        ALERT: UNAUTHORIZED ACCESS TO SYSTEM LOGS DETECTED. PROTOCOL V4.0 ENGAGED. STAY VIGILANT, PHANTOM.
      </div>
    </div>
  )
}
