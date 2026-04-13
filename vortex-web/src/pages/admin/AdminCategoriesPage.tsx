import { useState, useEffect, useMemo } from 'react'

interface CategoryData {
  id: string
  name: string
  description: string
  createdAt: string
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/categories')
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          const mapped = json.data.map((c: any) => ({
            id: String(c.category_id),
            name: c.name,
            description: c.description || '-',
            createdAt: c.created_at ? c.created_at.split('T')[0] : 'Unknown'
          }))
          setCategories(mapped)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // -- Search Filter --
  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [categories, searchQuery])

  // -- Form State --
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  
  const openAddModal = () => {
    setIsEditing(false)
    setEditingId(null)
    setForm({ name: '', description: '' })
    setShowModal(true)
  }

  const openEditModal = (category: CategoryData) => {
    setIsEditing(true)
    setEditingId(category.id)
    setForm({ name: category.name, description: category.description })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return

    try {
      const url = isEditing ? `/api/categories/${editingId}` : '/api/categories'
      const token = localStorage.getItem('vortex.auth.token') || localStorage.getItem('auth_token')
      
      const payload: any = {
        name: form.name,
        description: form.description
      }
      if (isEditing) {
        payload._method = 'PUT'
      }

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (response.ok && result.data) {
        await fetchCategories()
        setShowModal(false)
        setForm({ name: '', description: '' })
      } else {
        alert('Action failed: ' + (result.message || 'Validation error'))
      }
    } catch (err) {
      alert('Network Error')
    }
  }

  const handleDelete = async (category: CategoryData) => {
    if (!confirm(`Are you sure you want to delete category "${category.name}"?`)) return

    try {
      const token = localStorage.getItem('vortex.auth.token') || localStorage.getItem('auth_token')
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        await fetchCategories()
      } else {
        alert('Could not delete category. It might be used by events.')
      }
    } catch (err) {
      alert('Network Error')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out z-10 relative pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Categories</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5 break-words">
            Manage global categories for events
            {isLoading && <span className="text-indigo-400 animate-pulse ml-2">(Live Sync...)</span>}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-semibold tracking-wide text-sm px-6 py-3 rounded-2xl transition-all shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">add</span>
          New Category
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between backdrop-blur-xl shadow-lg">
        <div className="relative w-full md:w-96 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white/80 transition-colors">search</span>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all font-medium"
          />
        </div>
        <div className="text-sm text-white/50 px-2 font-mono">
          Showing {filteredCategories.length} items
        </div>
      </div>

      {/* Categories Grid/Table */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-[24px] overflow-hidden backdrop-blur-xl shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.1] bg-black/40">
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">ID</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Category Name</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest">Description</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Created</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/[0.03] transition-colors duration-300 group cursor-pointer" onClick={() => openEditModal(cat)}>
                  <td className="p-5 text-sm font-medium text-white/60 font-mono">#{cat.id}</td>
                  <td className="p-5">
                    <p className="font-semibold text-sm text-white/90">{cat.name}</p>
                  </td>
                  <td className="p-5">
                    <p className="text-xs text-white/50 truncate max-w-sm">{cat.description}</p>
                  </td>
                  <td className="p-5 text-sm font-medium text-white/40 font-mono">{cat.createdAt}</td>
                  <td className="p-5 text-right w-32" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(cat)} className="text-zinc-500 hover:text-white p-2 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(cat)} className="text-zinc-500 hover:text-rose-400 p-2 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-white/10 mb-3 block">category</span>
                    <p className="text-sm text-white/30">No categories found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-6">
              {isEditing ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-white/50 mb-2">Category Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:bg-white/10 focus:border-white/20 focus:outline-none transition-all placeholder:text-white/20"
                  placeholder="e.g. Music, Tech, Sports"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-white/50 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:bg-white/10 focus:border-white/20 focus:outline-none transition-all placeholder:text-white/20 min-h-[100px]"
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 px-4 rounded-xl font-semibold text-white/60 bg-white/5 hover:bg-white/10 hover:text-white transition-all text-sm border border-transparent">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all text-sm border border-indigo-400/50 hover:border-indigo-300">
                  {isEditing ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
