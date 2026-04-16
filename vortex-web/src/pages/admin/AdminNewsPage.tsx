import React, { useState, useEffect } from 'react'
import { Plus, X, Trash2, Edit2, Send, Upload } from 'lucide-react'
import { useToast } from '../../components/Toast'

interface News {
  news_id: number
  title: string
  content: string
  tag: string
  urgency: string
  image_url: string | null
  event_id: number | null
  is_published: boolean
  published_at: string
  author_id: number
}

interface Event {
  event_id: number
  title: string
}

export function AdminNewsPage() {
  const { showToast } = useToast()
  const [newsList, setNewsList] = useState<News[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [filter, setFilter] = useState('all')
  const [uploadedImage, setUploadedImage] = useState<string>('')
  const token = localStorage.getItem('vortex.auth.token')

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tag: 'SYSTEM',
    urgency: 'NORMAL',
    image_url: '',
    event_id: '',
    is_published: true,
  })

  const tags = ['SYSTEM', 'SECURITY', 'LINEUP', 'DROPS', 'UPDATE', 'BREAKING']
  const urgencies = ['NORMAL', 'HIGH', 'CRITICAL']

  useEffect(() => {
    fetchNews()
    fetchEvents()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/admin/news', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      setNewsList(data.data || data)
    } catch (err) {
      console.error('Failed to fetch news:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data.data || data)
    } catch (err) {
      console.error('Failed to fetch events:', err)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setUploadedImage(base64)
      setFormData({ ...formData, image_url: base64 })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const method = editingNews ? 'PUT' : 'POST'
      const endpoint = editingNews
        ? `/api/admin/news/${editingNews.news_id}/update`
        : '/api/admin/news/create'

      const payload = {
        title: formData.title,
        content: formData.content,
        tag: formData.tag,
        urgency: formData.urgency,
        image_url: formData.image_url,
        event_id: formData.event_id ? parseInt(formData.event_id) : null,
        is_published: formData.is_published,
        published_at: new Date().toISOString(),
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        fetchNews()
        setShowModal(false)
        resetForm()
        showToast(`News article ${editingNews ? 'updated' : 'published'} successfully`, 'success')
      } else {
        showToast('Failed to save news article', 'error')
      }
    } catch (err) {
      console.error('Failed to save news:', err)
      showToast('Network error', 'error')
    }
  }

  const handleDelete = async (newsId: number) => {
    if (!window.confirm('Delete this news article?')) return

    try {
      const response = await fetch(`/api/admin/news/${newsId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        fetchNews()
        showToast('News article deleted successfully', 'success')
      } else {
        showToast('Failed to delete news article', 'error')
      }
    } catch (err) {
      console.error('Failed to delete news:', err)
      showToast('Network error', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tag: 'SYSTEM',
      urgency: 'NORMAL',
      image_url: '',
      event_id: '',
      is_published: true,
    })
    setUploadedImage('')
    setEditingNews(null)
  }

  const getTagColor = (tag: string): string => {
    const colors: Record<string, string> = {
      'SECURITY': 'bg-red-900/50 text-red-300 border-red-700',
      'LINEUP': 'bg-purple-900/50 text-purple-300 border-purple-700',
      'DROPS': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
      'UPDATE': 'bg-blue-900/50 text-blue-300 border-blue-700',
      'BREAKING': 'bg-hot-coral/30 text-primary border-primary',
      'SYSTEM': 'bg-primary/30 text-primary border-primary',
    }
    return colors[tag] || 'bg-zinc-700/50 text-zinc-300 border-zinc-600'
  }

  const getUrgencyColor = (urgency: string): string => {
    const colors: Record<string, string> = {
      'CRITICAL': 'bg-red-900/50 text-red-300 border-red-700',
      'HIGH': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
      'NORMAL': 'bg-blue-900/50 text-blue-300 border-blue-700',
    }
    return colors[urgency] || 'bg-zinc-700/50'
  }

  const filteredNews = newsList.filter(n => {
    if (filter === 'all') return true
    if (filter === 'published') return n.is_published
    if (filter === 'draft') return !n.is_published
    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">
            Broadcast Center
          </h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">
            Manage global news feeds and system announcements
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-primary/20 hover:bg-primary/30 border border-primary text-primary font-semibold tracking-wide text-sm px-6 py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          New Article
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'published', label: 'Published' },
          { value: 'draft', label: 'Drafts' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg font-accent text-xs uppercase tracking-wider transition-all ${
              filter === tab.value
                ? 'bg-primary text-black'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)]">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading...</div>
        ) : filteredNews.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">No news articles</div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {filteredNews.map(article => (
              <div
                key={article.news_id}
                className="p-6 hover:bg-white/[0.05] transition-colors duration-300 group flex items-start justify-between"
              >
                <div className="flex items-start gap-4 flex-1">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt="article"
                      className="w-16 h-16 rounded border border-white/10 object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-display text-lg text-white">{article.title}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${getTagColor(article.tag)}`}>
                        {article.tag}
                      </span>
                      {article.urgency !== 'NORMAL' && (
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${getUrgencyColor(article.urgency)}`}>
                          {article.urgency}
                        </span>
                      )}
                      {!article.is_published && (
                        <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">DRAFT</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">{article.content}</p>
                    <div className="text-xs text-zinc-500 mt-2">
                      {new Date(article.published_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <button
                    onClick={() => {
                      setEditingNews(article)
                      setFormData({
                        title: article.title,
                        content: article.content,
                        tag: article.tag,
                        urgency: article.urgency,
                        image_url: article.image_url || '',
                        event_id: article.event_id?.toString() || '',
                        is_published: article.is_published,
                      })
                      setUploadedImage('')
                      setShowModal(true)
                    }}
                    className="p-2 hover:bg-zinc-700 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-zinc-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(article.news_id)}
                    className="p-2 hover:bg-red-900/30 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-black/60 backdrop-blur-[60px] border border-white/[0.15] rounded-[32px] w-full max-w-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 ease-out">
            <div className="p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white tracking-tight">
                  {editingNews ? 'Edit Article' : 'Publish Article'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength={255}
                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded px-3 py-2 font-mono text-sm placeholder-zinc-600 focus:border-primary outline-none transition-colors"
                    placeholder="Article headline"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={5}
                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded px-3 py-2 font-mono text-sm placeholder-zinc-600 focus:border-primary outline-none transition-colors resize-none"
                    placeholder="Article content"
                  />
                </div>

                {/* Tag and Urgency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
                      Tag
                    </label>
                    <select
                      value={formData.tag}
                      onChange={e => setFormData({ ...formData, tag: e.target.value })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded px-3 py-2 font-mono text-sm"
                    >
                      {tags.map(t => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
                      Urgency
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                      className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded px-3 py-2 font-mono text-sm"
                    >
                      {urgencies.map(u => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image: URL or Upload */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
                    Image (Optional)
                  </label>
                  <div className="space-y-3">
                    {/* URL Option */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                        className="flex-1 bg-zinc-800/50 border border-zinc-700 text-white rounded px-3 py-2 font-mono text-sm placeholder-zinc-600 focus:border-primary outline-none transition-colors"
                        placeholder="https://example.com/image.jpg"
                      />
                      {formData.image_url && !formData.image_url.startsWith('data:') && (
                        <img
                          src={formData.image_url}
                          alt="preview"
                          className="w-10 h-10 rounded border border-zinc-700 object-cover"
                          onError={() => setFormData({ ...formData, image_url: '' })}
                        />
                      )}
                    </div>

                    {/* File Upload Option */}
                    <div>
                      <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                        <Upload className="w-4 h-4 text-zinc-500 group-hover:text-primary" />
                        <span className="text-sm text-zinc-400 group-hover:text-primary transition-colors">
                          {uploadedImage ? 'Image Selected' : 'Or Upload Image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Image Preview */}
                    {formData.image_url && (
                      <div className="relative">
                        <img
                          src={formData.image_url}
                          alt="preview"
                          className="w-full h-32 rounded border border-zinc-700 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image_url: '' })
                            setUploadedImage('')
                          }}
                          className="absolute top-2 right-2 bg-red-900 hover:bg-red-800 text-white p-1 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Link to Event (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
                    Link to Event (Optional)
                  </label>
                  <select
                    value={formData.event_id}
                    onChange={e => setFormData({ ...formData, event_id: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded px-3 py-2 font-mono text-sm"
                  >
                    <option value="">No Event Link</option>
                    {events.map(event => (
                      <option key={event.event_id} value={event.event_id.toString()}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-500 mt-2">This broadcast will be linked to the selected event</p>
                </div>

                {/* Publish Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-white/80">Publish immediately</label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl bg-zinc-800 text-white font-semibold text-sm hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-2xl bg-primary text-black font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {editingNews ? 'Update' : 'Publish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
