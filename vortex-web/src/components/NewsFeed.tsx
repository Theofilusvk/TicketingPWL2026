import { useState, useEffect } from 'react'

interface NewsItem {
  news_id: number
  title: string
  content: string
  tag: string
  urgency: string
  image_url: string | null
  published_at: string
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news/recent?limit=5')
      const data = await response.json()
      setNews(data)
    } catch (error) {
      console.error('Failed to fetch news:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTagColor = (tag: string): string => {
    const colors: Record<string, string> = {
      'SECURITY': 'bg-red-600 text-red-100',
      'LINEUP': 'bg-purple-600 text-purple-100',
      'DROPS': 'bg-yellow-600 text-yellow-100',
      'UPDATE': 'bg-blue-600 text-blue-100',
      'BREAKING': 'bg-hot-coral text-black',
      'SYSTEM': 'bg-primary text-black',
    }
    return colors[tag] || 'bg-zinc-600 text-zinc-100'
  }

  const getUrgencyBadge = (urgency: string): string => {
    const colors: Record<string, string> = {
      'CRITICAL': 'bg-hot-coral text-black',
      'HIGH': 'bg-yellow-600 text-yellow-100',
      'NORMAL': 'bg-zinc-700 text-zinc-300',
    }
    return colors[urgency] || colors['NORMAL']
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border-[3px] border-primary p-6">
        <h2 className="font-display text-4xl text-primary mb-8 inline-block border-b-4 border-primary pb-1">
          NEWS_FEED
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-primary font-accent text-sm">LOADING...</div>
          </div>
        ) : news.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-zinc-400 font-accent text-sm">NO NEWS AVAILABLE</div>
          </div>
        ) : (
          <div className="space-y-8">
            {news.map((item) => (
              <div key={item.news_id} className="flex flex-col gap-2 relative">
                <div className="flex justify-between items-center">
                  <span className="font-accent text-[8px] text-zinc-500">
                    {formatDate(item.published_at)}
                  </span>
                  <div className="flex gap-2">
                    <span className={`font-accent text-[8px] px-2 py-0.5 font-bold tracking-widest ${getTagColor(item.tag)}`}>
                      {item.tag}
                    </span>
                    {item.urgency !== 'NORMAL' && (
                      <span className={`font-accent text-[8px] px-2 py-0.5 font-bold tracking-widest ${getUrgencyBadge(item.urgency)}`}>
                        {item.urgency}
                      </span>
                    )}
                  </div>
                </div>
                {item.image_url && (
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-32 object-cover border border-primary mb-2"
                  />
                )}
                <h3 className="font-display text-2xl text-white">{item.title}</h3>
                <p className="font-accent text-[10px] text-zinc-400 leading-relaxed max-w-full line-clamp-3">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}

        <a 
          href="/news" 
          className="block w-full mt-8 border border-primary text-primary hover:bg-primary hover:text-black transition-colors py-3 font-accent font-bold text-[10px] uppercase tracking-widest text-center"
        >
          VIEW ALL UPDATES
        </a>
      </div>

      <div className="bg-hot-coral p-4 text-black font-accent text-[10px] tracking-widest font-bold uppercase leading-snug">
        ALERT: UNAUTHORIZED ACCESS TO SYSTEM LOGS DETECTED. PROTOCOL V4.0 ENGAGED. STAY VIGILANT, PHANTOM.
      </div>
    </div>
  )
}
