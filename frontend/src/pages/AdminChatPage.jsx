import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const STATUS_BADGE = {
  open: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
}
const STATUS_LABEL = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', archived: 'Archived' }
const FILTERS = ['all', 'open', 'in_progress', 'resolved', 'archived']
const FILTER_LABEL = { all: 'All', open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', archived: 'Archived' }

const LEAD_STATUS = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', converted: 'Converted', lost: 'Lost' }
const TICKET_PRIORITY = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' }
const TICKET_STATUS = { open: 'Open', pending: 'Pending', closed: 'Closed' }

const AVATAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-violet-500', 'bg-pink-500',
]

function getAvatarColor(id) {
  let hash = 0
  for (let i = 0; i < (id || '').length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name) {
  if (name && name !== 'Visitor') {
    const parts = name.trim().split(/\s+/)
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase()
  }
  return 'V'
}

function fmtTime(d) {
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(d) {
  const date = new Date(d)
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + fmtTime(d)
}

export default function AdminChatPage({ onLogout, embedded = false }) {
  const [conversations, setConversations] = useState([])
  const [filter, setFilter] = useState('all')
  const [chatReadFilter, setChatReadFilter] = useState('all') // all | unread | read
  const [chatSelected, setChatSelected] = useState({})
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [activeConvo, setActiveConvo] = useState(null)
  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [statusDropdown, setStatusDropdown] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [view, setView] = useState('chats')
  const [feedbackList, setFeedbackList] = useState([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackReadFilter, setFeedbackReadFilter] = useState('all') // all | unread | read
  const [feedbackSelected, setFeedbackSelected] = useState({})
  const [deleteFeedbackTarget, setDeleteFeedbackTarget] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [leads, setLeads] = useState([])
  const [leadsFilter, setLeadsFilter] = useState('')
  const [leadsSearch, setLeadsSearch] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [tickets, setTickets] = useState([])
  const [ticketReadFilter, setTicketReadFilter] = useState('all') // all | unread | read
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all') // all | open | pending | closed
  const [ticketSelected, setTicketSelected] = useState({})
  const [ticketModal, setTicketModal] = useState(null)
  const [newLeadAlert, setNewLeadAlert] = useState(null)
  const socketRef = useRef(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimeout = useRef(null)
  const prevActiveId = useRef(null)
  const activeIdRef = useRef(null)
  const fetchConversationsRef = useRef(() => {})
  const fetchMessagesRef = useRef(() => {})
  const fetchTicketsRef = useRef(() => {})
  const fetchLeadsRef = useRef(() => {})
  const onLogoutRef = useRef(onLogout)

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('admin_token')
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }, [])

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/conversations', { headers: getAuthHeaders() })
      if (res.status === 401) { onLogout?.(); return }
      const data = await res.json()
      setConversations(data)
    } catch { /* ignore */ }
  }, [getAuthHeaders, onLogout])
  fetchConversationsRef.current = fetchConversations

  const fetchMessages = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/admin/conversations/${id}/messages`, { headers: getAuthHeaders() })
      if (res.status === 401) { onLogout?.(); return }
      const data = await res.json()
      setMessages(data)
    } catch { /* ignore */ }
  }, [getAuthHeaders, onLogout])
  fetchMessagesRef.current = fetchMessages

  const fetchFeedback = useCallback(async () => {
    setFeedbackLoading(true)
    try {
      const res = await fetch('/api/admin/feedback', { headers: getAuthHeaders() })
      if (res.status === 401) { onLogout?.(); return }
      setFeedbackList(await res.json())
    } catch { /* ignore */ }
    setFeedbackLoading(false)
  }, [getAuthHeaders, onLogout])

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (leadsFilter) params.set('status', leadsFilter)
      if (leadsSearch) params.set('search', leadsSearch)
      const res = await fetch(`/api/admin/leads?${params}`, { headers: getAuthHeaders() })
      if (res.status === 401) { onLogout?.(); return }
      setLeads(await res.json())
    } catch { /* ignore */ }
  }, [getAuthHeaders, onLogout, leadsFilter, leadsSearch])
  fetchLeadsRef.current = fetchLeads

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      const res = await fetch('/api/admin/analytics?since=-7 days', { headers: getAuthHeaders() })
      if (res.status === 401) { onLogout?.(); return }
      setAnalytics(await res.json())
    } catch { /* ignore */ }
    setAnalyticsLoading(false)
  }, [getAuthHeaders, onLogout])

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tickets', { headers: getAuthHeaders() })
      if (res.status === 401) { onLogout?.(); return }
      setTickets(await res.json())
    } catch { /* ignore */ }
  }, [getAuthHeaders, onLogout])
  fetchTicketsRef.current = fetchTickets

  const bulkAction = async (resource, action, ids) => {
    if (!ids?.length) return
    await fetch('/api/admin/bulk', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resource, action, ids }),
    })
    if (resource === 'conversations') { setChatSelected({}); fetchConversations() }
    if (resource === 'feedback') { setFeedbackSelected({}); fetchFeedback() }
    if (resource === 'tickets') { setTicketSelected({}); fetchTickets() }
  }

  useEffect(() => { fetchConversations() }, [fetchConversations])

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  useEffect(() => {
    onLogoutRef.current = onLogout
  }, [onLogout])

  useEffect(() => {
    if (view === 'leads') fetchLeads()
  }, [view, leadsFilter, leadsSearch, fetchLeads])

  useEffect(() => {
    if (view === 'analytics') fetchAnalytics()
  }, [view, fetchAnalytics])

  useEffect(() => {
    if (view === 'tickets') fetchTickets()
  }, [view, fetchTickets])

  // If leaving Chats view, close the active conversation/chat UI.
  useEffect(() => {
    if (view === 'chats') return
    if (prevActiveId.current) {
      socketRef.current?.emit('admin:leaveConversation', prevActiveId.current)
      prevActiveId.current = null
    }
    setActiveId(null)
    setActiveConvo(null)
    setMessages([])
    setInput('')
    setStatusDropdown(false)
  }, [view])

  useEffect(() => {
    const socket = io({
      auth: { token: localStorage.getItem('admin_token') || '' },
    })
    socketRef.current = socket
    socket.emit('admin:join')
    socket.on('admin:unauthorized', () => onLogoutRef.current?.())
    socket.on('conversations:refresh', () => fetchConversationsRef.current())
    socket.on('tickets:refresh', () => fetchTicketsRef.current())
    socket.on('admin:newLead', (lead) => {
      setNewLeadAlert(lead)
      fetchLeadsRef.current()
      setTimeout(() => setNewLeadAlert(null), 6000)
    })
    socket.on('chat:message', (msg) => {
      setMessages((prev) => (msg.conversation_id === activeIdRef.current ? [...prev, msg] : prev))
    })
    socket.on('chat:newMessage', ({ conversationId }) => {
      fetchConversationsRef.current()
      if (conversationId === activeIdRef.current) fetchMessagesRef.current(conversationId)
    })
    return () => socket.disconnect()
  }, [])

  useEffect(() => {
    if (!activeId) return
    if (prevActiveId.current && prevActiveId.current !== activeId)
      socketRef.current?.emit('admin:leaveConversation', prevActiveId.current)
    socketRef.current?.emit('admin:joinConversation', activeId)
    prevActiveId.current = activeId
    fetchMessages(activeId)
    const convo = conversations.find((c) => c.id === activeId)
    setActiveConvo(convo || null)
  }, [activeId, fetchMessages])

  useEffect(() => {
    if (activeId) {
      const convo = conversations.find((c) => c.id === activeId)
      if (convo) setActiveConvo(convo)
    }
  }, [conversations, activeId])

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || !activeId) return
    setInput('')
    socketRef.current?.emit('admin:message', { conversationId: activeId, content: text, adminName: 'Support Agent' })
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    socketRef.current?.emit('admin:typing', { conversationId: activeId })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('admin:typingStop', { conversationId: activeId })
    }, 1500)
  }

  const changeStatus = async (id, status) => {
    try {
      if (status === 'archived') {
        await fetch(`/api/admin/conversations/${id}/archive`, {
          method: 'PATCH', headers: getAuthHeaders(),
        })
      } else {
        await fetch(`/api/admin/conversations/${id}/status`, {
          method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status }),
        })
      }
      fetchConversations()
      if (id === activeId) setActiveConvo((c) => c ? { ...c, status } : c)
    } catch (err) {
      console.error('Failed to change status:', err)
    }
    setStatusDropdown(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await fetch(`/api/admin/conversations/${deleteTarget}`, {
        method: 'DELETE', headers: getAuthHeaders(),
      })
      fetchConversations()
      if (deleteTarget === activeId) {
        setActiveId(null)
        setActiveConvo(null)
        setMessages([])
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err)
    }
    setDeleteTarget(null)
  }

  const handleDeleteFeedback = async () => {
    if (!deleteFeedbackTarget) return
    try {
      await fetch(`/api/admin/feedback/${deleteFeedbackTarget}`, {
        method: 'DELETE', headers: getAuthHeaders(),
      })
      fetchFeedback()
    } catch (err) {
      console.error('Failed to delete feedback:', err)
    }
    setDeleteFeedbackTarget(null)
  }

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      if (view === 'chats') await fetchConversations()
      else if (view === 'feedback') await fetchFeedback()
      else if (view === 'leads') await fetchLeads()
      else if (view === 'analytics') await fetchAnalytics()
      else if (view === 'tickets') await fetchTickets()
    } finally {
      setTimeout(() => setRefreshing(false), 400)
    }
  }

  const exportLeadsCsv = async () => {
    const params = new URLSearchParams({ format: 'csv' })
    if (leadsFilter) params.set('status', leadsFilter)
    if (leadsSearch) params.set('search', leadsSearch)
    try {
      const res = await fetch(`/api/admin/leads/export?${params}`, { headers: getAuthHeaders() })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'leads.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
  }

  const updateLeadStatusById = async (leadId, status) => {
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status }),
      })
      fetchLeads()
    } catch (e) { console.error(e) }
  }

  const createTicketForConvo = async (conversationId) => {
    try {
      await fetch('/api/admin/tickets', {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ conversation_id: conversationId, priority: 'medium', status: 'open' }),
      })
      setTicketModal(null)
      setView('tickets')
      fetchTickets()
    } catch (e) { console.error(e) }
  }

  const updateTicketById = async (ticketId, data) => {
    try {
      await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
      })
      fetchTickets()
    } catch (e) { console.error(e) }
  }

  const filteredBase = filter === 'all' ? conversations : conversations.filter((c) => c.status === filter)
  const filtered = filteredBase.filter((c) => {
    const unread = (c.admin_unread_count || 0) > 0
    if (chatReadFilter === 'unread') return unread
    if (chatReadFilter === 'read') return !unread
    return true
  })

  const filteredFeedback = feedbackList.filter((f) => {
    if (feedbackReadFilter === 'unread') return !f.is_read
    if (feedbackReadFilter === 'read') return !!f.is_read
    return true
  })

  const filteredTickets = tickets.filter((t) => {
    if (ticketStatusFilter !== 'all' && t.status !== ticketStatusFilter) return false
    const unread = !!t.is_unread
    if (ticketReadFilter === 'unread') return unread
    if (ticketReadFilter === 'read') return !unread
    return true
  })

  const displayName = (c) => c.visitor_name || 'Visitor'
  const displaySub = (c) => c.visitor_email || c.id.slice(0, 8)

  return (
    <div className={embedded ? 'flex h-[720px] min-h-[560px] overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card' : 'flex h-screen bg-white'}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <div className={`${sidebarOpen ? 'w-[320px] min-w-[320px]' : 'w-0 min-w-0'} flex flex-col border-r border-gray-200 bg-white transition-all duration-200 overflow-hidden`}>

        {/* Sidebar header */}
        <div className="border-b border-gray-100 px-5 pb-4 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-400">
                {view === 'chats' && `${filtered.length} conversation${filtered.length !== 1 ? 's' : ''}`}
                {view === 'feedback' && `${feedbackList.length} feedback${feedbackList.length !== 1 ? 's' : ''}`}
                {view === 'leads' && `${leads.length} lead${leads.length !== 1 ? 's' : ''}`}
                {view === 'analytics' && 'Visitor analytics'}
                {view === 'tickets' && `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleRefresh} title="Refresh" disabled={refreshing}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 active:scale-90 disabled:opacity-50">
                <svg className={`h-4 w-4 transition-transform duration-500 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
              </button>
              {!embedded && (
                <button onClick={onLogout} title="Logout"
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* View tabs */}
          <div className="mt-3 flex flex-wrap gap-1 rounded-lg bg-gray-100 p-0.5">
            <button onClick={() => setView('chats')}
              className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${view === 'chats' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Chats
            </button>
            <button onClick={() => { setView('feedback'); fetchFeedback() }}
              className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${view === 'feedback' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Feedback
            </button>
            <button onClick={() => setView('leads')}
              className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${view === 'leads' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Leads
            </button>
            <button onClick={() => setView('analytics')}
              className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${view === 'analytics' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Analytics
            </button>
            <button onClick={() => setView('tickets')}
              className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${view === 'tickets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Tickets
            </button>
          </div>

          {/* Filter tabs (chats only) */}
          {view === 'chats' && (
            <div className="mt-3 space-y-2">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {FILTERS.map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold transition ${filter === f ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {FILTER_LABEL[f]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <select value={chatReadFilter} onChange={(e) => setChatReadFilter(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-brand-primary">
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  const allIds = filtered.map((c) => c.id)
                  const next = {}
                  allIds.forEach((id) => { next[id] = true })
                  setChatSelected(next)
                }} className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Select all</button>
                <button onClick={() => setChatSelected({})} className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Clear</button>
              </div>
            </div>
          )}
          {view === 'feedback' && (
            <div className="mt-3 space-y-2">
              <select value={feedbackReadFilter} onChange={(e) => setFeedbackReadFilter(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-brand-primary">
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => {
                  const allIds = filteredFeedback.map((f) => f.id)
                  const next = {}
                  allIds.forEach((id) => { next[id] = true })
                  setFeedbackSelected(next)
                }} className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Select all</button>
                <button onClick={() => setFeedbackSelected({})} className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Clear</button>
              </div>
            </div>
          )}
          {view === 'tickets' && (
            <div className="mt-3 space-y-2">
              <select value={ticketStatusFilter} onChange={(e) => setTicketStatusFilter(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-brand-primary">
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
              <select value={ticketReadFilter} onChange={(e) => setTicketReadFilter(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-brand-primary">
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => {
                  const allIds = filteredTickets.map((t) => t.id)
                  const next = {}
                  allIds.forEach((id) => { next[id] = true })
                  setTicketSelected(next)
                }} className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Select all</button>
                <button onClick={() => setTicketSelected({})} className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Clear</button>
              </div>
            </div>
          )}
          {view === 'leads' && (
            <div className="mt-3 space-y-2">
              <input type="text" placeholder="Search leads..." value={leadsSearch} onChange={(e) => setLeadsSearch(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-brand-primary" />
              <select value={leadsFilter} onChange={(e) => setLeadsFilter(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-brand-primary">
                <option value="">All statuses</option>
                {Object.entries(LEAD_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto">
          {view === 'chats' && (
            <>
              {filtered.length === 0 && (
                <p className="px-5 py-10 text-center text-sm text-gray-400">No conversations</p>
              )}
              {filtered.map((c) => {
                const isActive = activeId === c.id
                const initials = getInitials(c.visitor_name)
                const color = getAvatarColor(c.id)
                const unread = (c.admin_unread_count || 0) > 0
                return (
                  <div key={c.id} className={`flex w-full items-start gap-3 border-b border-gray-50 px-5 py-3.5 text-left transition hover:bg-gray-50 ${isActive ? 'bg-brand-primary/5' : ''}`}>
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={!!chatSelected[c.id]}
                      onChange={(e) => setChatSelected((p) => ({ ...p, [c.id]: e.target.checked }))}
                    />
                    <button
                      onClick={() => { setActiveId(c.id); setView('chats'); if (window.innerWidth < 768) setSidebarOpen(false) }}
                      className="flex flex-1 items-start gap-3 text-left"
                    >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-gray-800">
                          {displayName(c)}{unread ? <span className="ml-2 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">Unread</span> : null}
                        </span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[c.status]}`}>
                          {STATUS_LABEL[c.status]}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-gray-400">{displaySub(c)}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-400">
                        <span>{fmtDate(c.updated_at)}</span>
                        {c.mode === 'human' && (
                          <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-semibold text-orange-600">Human</span>
                        )}
                      </div>
                    </div>
                    </button>
                  </div>
                )
              })}
            </>
          )}
          {view === 'feedback' && (
            <>
              {feedbackLoading && (
                <p className="px-5 py-10 text-center text-sm text-gray-400">Loading...</p>
              )}
              {!feedbackLoading && feedbackList.length === 0 && (
                <p className="px-5 py-10 text-center text-sm text-gray-400">No feedback yet</p>
              )}
              {!feedbackLoading && filteredFeedback.map((fb, i) => (
                <div key={fb.id || i} className="group flex items-start gap-3 border-b border-gray-50 px-5 py-3.5 transition hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={!!feedbackSelected[fb.id]}
                    onChange={(e) => setFeedbackSelected((p) => ({ ...p, [fb.id]: e.target.checked }))}
                  />
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${getAvatarColor(fb.name || 'A')}`}>
                    {getInitials(fb.name || 'Anonymous')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-gray-800">
                        {fb.name || 'Anonymous'}{!fb.is_read ? <span className="ml-2 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">Unread</span> : null}
                      </span>
                      <span className="flex shrink-0 gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`text-[10px] ${fb.rating >= s ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                        ))}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-gray-600">{fb.comment}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">{fmtDate(fb.created_at)}</p>
                  </div>
                  <button onClick={() => setDeleteFeedbackTarget(fb.id)} title="Delete feedback"
                    className="shrink-0 rounded-md p-1 text-gray-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  </button>
                </div>
              ))}
            </>
          )}
          {view === 'leads' && (
            <div className="px-3 py-2 text-center text-xs text-gray-400">Use main area for table & export</div>
          )}
          {view === 'analytics' && (
            <div className="px-3 py-2 text-center text-xs text-gray-400">Charts in main area</div>
          )}
          {view === 'tickets' && (
            <>
              {filteredTickets.length === 0 && <p className="px-5 py-10 text-center text-sm text-gray-400">No tickets</p>}
              {filteredTickets.map((t) => (
                <div key={t.id} className="flex w-full items-center gap-3 border-b border-gray-50 px-5 py-3 text-left transition hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={!!ticketSelected[t.id]}
                    onChange={(e) => setTicketSelected((p) => ({ ...p, [t.id]: e.target.checked }))}
                  />
                  <button onClick={() => setTicketModal(t)} className="flex flex-1 items-center justify-between">
                    <span className="truncate text-xs font-mono text-gray-700">
                      {t.ticket_id}{t.is_unread ? <span className="ml-2 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">Unread</span> : null}
                    </span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.status === 'open' ? 'bg-yellow-100 text-yellow-700' : t.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{TICKET_STATUS[t.status]}</span>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── New lead toast ──────────────────────────────────── */}
      {newLeadAlert && (
        <div className="fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg">
          <span className="text-lg">🎉</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">New lead</p>
            <p className="text-xs text-gray-600">{newLeadAlert.name} — {newLeadAlert.email}</p>
          </div>
          <button onClick={() => setNewLeadAlert(null)} className="rounded p-1 text-gray-400 hover:bg-emerald-100 hover:text-gray-600">×</button>
        </div>
      )}

      {/* ── Main chat area ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {view === 'feedback' ? (
              <div>
                <p className="text-sm font-semibold text-gray-900">Customer Feedback</p>
                <p className="text-[11px] text-gray-400">{feedbackList.length} total submission{feedbackList.length !== 1 ? 's' : ''}</p>
              </div>
            ) : view === 'leads' ? (
              <div>
                <p className="text-sm font-semibold text-gray-900">CRM — Leads</p>
                <p className="text-[11px] text-gray-400">{leads.length} lead{leads.length !== 1 ? 's' : ''}</p>
              </div>
            ) : view === 'analytics' ? (
              <div>
                <p className="text-sm font-semibold text-gray-900">Visitor Analytics</p>
                <p className="text-[11px] text-gray-400">Last 7 days</p>
              </div>
            ) : view === 'tickets' ? (
              <div>
                <p className="text-sm font-semibold text-gray-900">Support Tickets</p>
                <p className="text-[11px] text-gray-400">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
              </div>
            ) : activeConvo ? (
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${getAvatarColor(activeConvo.id)}`}>
                  {getInitials(activeConvo.visitor_name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{displayName(activeConvo)}</p>
                  <p className="text-[11px] text-gray-400">{activeConvo.visitor_email || 'No email'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Select a conversation</p>
            )}
          </div>

          {view === 'chats' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkAction('conversations', 'markRead', Object.keys(chatSelected).filter((k) => chatSelected[k]))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Mark read
              </button>
              <button
                onClick={() => bulkAction('conversations', 'markUnread', Object.keys(chatSelected).filter((k) => chatSelected[k]))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Mark unread
              </button>
              <button
                onClick={() => bulkAction('conversations', 'delete', Object.keys(chatSelected).filter((k) => chatSelected[k]))}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete selected
              </button>
              {activeConvo && (
                <>
              {/* Status dropdown */}
              <div className="relative">
                <button onClick={() => setStatusDropdown((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${STATUS_BADGE[activeConvo.status]}`}>
                  {STATUS_LABEL[activeConvo.status]}
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {statusDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setStatusDropdown(false)} />
                    <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      {['open', 'in_progress', 'resolved', 'archived'].map((s) => (
                        <button key={s} onClick={() => changeStatus(activeId, s)}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-gray-50 ${activeConvo.status === s ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                          <span className={`h-2 w-2 rounded-full ${s === 'open' ? 'bg-yellow-400' : s === 'in_progress' ? 'bg-blue-400' : s === 'resolved' ? 'bg-green-400' : 'bg-gray-400'}`} />
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Delete button */}
              <button title="Delete conversation" onClick={() => setDeleteTarget(activeId)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
                </>
              )}
            </div>
          )}
          {view === 'feedback' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkAction('feedback', 'markRead', Object.keys(feedbackSelected).filter((k) => feedbackSelected[k]))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Mark read
              </button>
              <button
                onClick={() => bulkAction('feedback', 'markUnread', Object.keys(feedbackSelected).filter((k) => feedbackSelected[k]))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Mark unread
              </button>
              <button
                onClick={() => bulkAction('feedback', 'delete', Object.keys(feedbackSelected).filter((k) => feedbackSelected[k]))}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete selected
              </button>
            </div>
          )}
          {view === 'tickets' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkAction('tickets', 'markRead', Object.keys(ticketSelected).filter((k) => ticketSelected[k]))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Mark read
              </button>
              <button
                onClick={() => bulkAction('tickets', 'markUnread', Object.keys(ticketSelected).filter((k) => ticketSelected[k]))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Mark unread
              </button>
              <button
                onClick={() => bulkAction('tickets', 'delete', Object.keys(ticketSelected).filter((k) => ticketSelected[k]))}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete selected
              </button>
            </div>
          )}
          {view === 'leads' && (
            <button onClick={exportLeadsCsv} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50">
              Export CSV
            </button>
          )}
          {view === 'chats' && activeId && (
            <button onClick={() => setTicketModal({ conversation_id: activeId })} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50" title="Create ticket from this conversation">
              Create ticket
            </button>
          )}
        </div>

        {/* Messages / Feedback overview */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-50/50 px-6 py-5">
          {view === 'leads' && (
            <div className="mx-auto max-w-6xl">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Phone</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Company</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Inquiry</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Source</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.length === 0 && (
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No leads yet</td></tr>
                      )}
                      {leads.map((l) => (
                        <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">{l.name}</td>
                          <td className="px-4 py-3 text-gray-600">{l.email}</td>
                          <td className="px-4 py-3 text-gray-600">{l.phone || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{l.company || '—'}</td>
                          <td className="max-w-[200px] truncate px-4 py-3 text-gray-600" title={l.inquiry_message}>{l.inquiry_message || '—'}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{l.source_page || '—'}</td>
                          <td className="px-4 py-3">
                            <select value={l.status} onChange={(e) => updateLeadStatusById(l.id, e.target.value)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700">
                              {Object.entries(LEAD_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(l.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {view === 'analytics' && (
            <div className="mx-auto max-w-4xl space-y-6">
              {analyticsLoading && <p className="text-center text-gray-400">Loading analytics...</p>}
              {!analyticsLoading && analytics && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{analytics.visits}</p>
                      <p className="mt-0.5 text-xs text-gray-400">Visits (7d)</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalMessages}</p>
                      <p className="mt-0.5 text-xs text-gray-400">Messages</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{Math.floor((analytics.avgDurationSeconds || 0) / 60)}m</p>
                      <p className="mt-0.5 text-xs text-gray-400">Avg duration</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalVisits}</p>
                      <p className="mt-0.5 text-xs text-gray-400">Total visits</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="mb-3 text-sm font-semibold text-gray-700">By device</p>
                    <div className="space-y-2">
                      {Object.entries(analytics.byDevice || {}).map(([label, count]) => (
                        <div key={label} className="flex items-center gap-3">
                          <span className="w-20 text-xs text-gray-600">{label}</span>
                          <div className="flex-1 h-6 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-brand-primary" style={{ width: `${Math.min(100, (count / (analytics.visits || 1)) * 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="mb-3 text-sm font-semibold text-gray-700">By browser</p>
                    <div className="space-y-2">
                      {Object.entries(analytics.byBrowser || {}).map(([label, count]) => (
                        <div key={label} className="flex items-center gap-3">
                          <span className="w-20 text-xs text-gray-600">{label}</span>
                          <div className="flex-1 h-6 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-brand-primary" style={{ width: `${Math.min(100, (count / (analytics.visits || 1)) * 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="mb-3 text-sm font-semibold text-gray-700">By location</p>
                    <div className="space-y-2">
                      {Object.entries(analytics.byLocation || {}).slice(0, 10).map(([label, count]) => (
                        <div key={label} className="flex items-center gap-3">
                          <span className="w-32 truncate text-xs text-gray-600">{label}</span>
                          <div className="flex-1 h-6 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-brand-primary" style={{ width: `${Math.min(100, (count / (analytics.visits || 1)) * 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {!analyticsLoading && !analytics && <p className="text-center text-gray-400">No data yet</p>}
            </div>
          )}

          {view === 'tickets' && (
            <div className="mx-auto max-w-4xl space-y-4">
              {tickets.length === 0 && <p className="py-10 text-center text-gray-400">No tickets. Create one from a conversation (open a chat and click &quot;Create ticket&quot;).</p>}
              {tickets.map((t) => (
                <div key={t.id} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-sm font-semibold text-gray-900">{t.ticket_id}</p>
                      <p className="mt-1 text-xs text-gray-500">Conversation: {t.conversation_id}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select value={t.priority} onChange={(e) => updateTicketById(t.id, { priority: e.target.value })} className="rounded border border-gray-200 px-2 py-1 text-xs">
                        {Object.entries(TICKET_PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <select value={t.status} onChange={(e) => updateTicketById(t.id, { status: e.target.value })} className="rounded border border-gray-200 px-2 py-1 text-xs">
                        {Object.entries(TICKET_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Assigned:</span>
                    <input type="text" placeholder="Staff name" defaultValue={t.assigned_staff || ''} onBlur={(e) => updateTicketById(t.id, { assigned_staff: e.target.value || null })} className="flex-1 max-w-[200px] rounded border border-gray-200 px-2 py-1 text-xs" />
                  </div>
                  {t.notes !== undefined && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Notes:</span>
                      <p className="mt-0.5 text-sm text-gray-700">{t.notes || '—'}</p>
                    </div>
                  )}
                  <textarea placeholder="Add or edit notes..." defaultValue={t.notes || ''} onBlur={(e) => updateTicketById(t.id, { notes: e.target.value || null })} className="mt-2 w-full rounded border border-gray-200 px-3 py-2 text-xs outline-none focus:border-brand-primary" rows={2} />
                </div>
              ))}
            </div>
          )}

          {view === 'feedback' && (
            <div className="mx-auto w-full max-w-full px-2">
              {/* Stat cards */}
              {(() => {
                const total = feedbackList.length
                const avg = total > 0 ? (feedbackList.reduce((s, f) => s + f.rating, 0) / total).toFixed(1) : '0.0'
                const positive = feedbackList.filter((f) => f.rating >= 4).length
                return (
                  <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{total}</p>
                      <p className="mt-0.5 text-xs text-gray-400">Total</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center">
                      <p className="text-2xl font-bold text-amber-500">{avg}</p>
                      <p className="mt-0.5 text-xs text-gray-400">Avg Rating</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center">
                      <p className="text-2xl font-bold text-emerald-500">{positive}</p>
                      <p className="mt-0.5 text-xs text-gray-400">Positive</p>
                    </div>
                  </div>
                )
              })()}

              {/* Feedback cards */}
              <div className="space-y-3">
                {feedbackList.length === 0 && !feedbackLoading && (
                  <p className="py-10 text-center text-sm text-gray-400">No feedback submissions yet</p>
                )}
                {feedbackList.map((fb, i) => (
                  <div key={fb.id || i} className="group rounded-xl border border-gray-200 bg-white px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${getAvatarColor(fb.name || 'A')}`}>
                          {getInitials(fb.name || 'Anonymous')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{fb.name || 'Anonymous'}</p>
                          <p className="text-[11px] text-gray-400">{fb.email || 'No email'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className={`text-sm ${fb.rating >= s ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                          ))}
                        </div>
                        <button onClick={() => setDeleteFeedbackTarget(fb.id)} title="Delete feedback"
                          className="rounded-md p-1 text-gray-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{fb.comment}</p>
                    <p className="mt-2 text-[10px] text-gray-400">{fmtDate(fb.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {view === 'chats' && !activeId && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto mb-3 h-14 w-14 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-medium text-gray-400">Select a conversation to start replying</p>
              </div>
            </div>
          )}

          {view === 'chats' && activeId && messages.map((msg, i) => {
            const isUser = msg.sender === 'user'
            const isAdmin = msg.sender === 'admin'
            return (
              <div key={i} className={`mb-4 flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-[65%]">
                  {isAdmin && msg.admin_name && (
                    <p className="mb-1 text-right text-[10px] font-semibold text-brand-primary">{msg.admin_name}</p>
                  )}
                  {msg.sender === 'ai' && (
                    <p className="mb-1 text-right text-[10px] font-semibold text-gray-400">AI Bot</p>
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    isUser
                      ? 'rounded-tl-md bg-white text-gray-800 border border-gray-100'
                      : isAdmin
                        ? 'rounded-tr-md bg-brand-primary text-white'
                        : 'rounded-tr-md bg-brand-primary/90 text-white'
                  }`}>
                    {msg.content}
                  </div>
                  <p className={`mt-1 text-[10px] text-gray-400 ${isUser ? 'pl-1' : 'pr-1 text-right'}`}>
                    {fmtTime(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Reply input */}
        {view === 'chats' && activeId && activeConvo?.status !== 'resolved' && activeConvo?.status !== 'archived' && (
          <div className="border-t border-gray-200 bg-white px-5 py-3">
            <div className="flex items-end gap-3">
              <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 transition focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/15">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your reply..."
                  rows={1}
                  className="w-full resize-none bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white transition hover:bg-brand-primary-hover disabled:opacity-40"
                aria-label="Send"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {view === 'chats' && activeConvo?.status === 'resolved' && (
          <div className="border-t border-gray-200 bg-green-50 px-5 py-3 text-center text-sm text-green-700">
            This conversation has been resolved.
            <button onClick={() => changeStatus(activeId, 'open')} className="ml-2 font-semibold underline">Reopen</button>
          </div>
        )}
        {view === 'chats' && activeConvo?.status === 'archived' && (
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 text-center text-sm text-gray-500">
            This conversation has been archived.
            <button onClick={() => changeStatus(activeId, 'open')} className="ml-2 font-semibold underline">Reopen</button>
          </div>
        )}
      </div>

      {/* Create ticket modal */}
      {ticketModal && ticketModal.conversation_id && !ticketModal.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Create support ticket</h3>
            <p className="mt-2 text-sm text-gray-500">Create a ticket for this conversation.</p>
            <div className="mt-4">
              <p className="text-xs text-gray-400">Conversation: {ticketModal.conversation_id}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setTicketModal(null)} className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">Cancel</button>
              <button onClick={() => createTicketForConvo(ticketModal.conversation_id)} className="flex-1 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-hover">Create ticket</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete conversation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Delete conversation</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Permanently delete this conversation and all its messages? This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete feedback modal */}
      {deleteFeedbackTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Delete feedback</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Permanently delete this feedback submission? This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDeleteFeedbackTarget(null)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDeleteFeedback}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
