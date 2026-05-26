import React, { useState, useRef, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import logo from '../assets/apmc.png';

const formatTime = (d) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const QUICK_OPTIONS = [
  { id: 'ask', label: 'Ask a Question', icon: '💬' },
  { id: 'services', label: 'Our Services', icon: '🏢' },
  { id: 'track', label: 'Track Order / Service', icon: '📦' },
  { id: 'report', label: 'Report a Problem', icon: '⚠️' },
  { id: 'faq', label: 'View FAQ', icon: '📋' },
  { id: 'feedback', label: 'Customer Feedback', icon: '⭐' },
  { id: 'agent', label: 'Talk to Representative', icon: '👤' },
];

const FAQ_ITEMS = [
  { id: 'services', q: 'What services do you offer?', a: 'APMC offers Property Acquisition & Development, Leasing Services (Residential, Commercial, Office), Property & Asset Management, Project Management, and Risk & Credit Management.' },
  { id: 'contact', q: 'How can I contact support?', a: 'Phone: +63 998 596 9288\nEmail: sales@theamalgatedproperties.com\nOr use "Talk to Representative" to connect with a live agent.' },
  { id: 'hours', q: 'What are your working hours?', a: 'Monday to Friday, 8:00 AM – 5:00 PM (Philippine Standard Time). Closed on weekends and public holidays.' },
  { id: 'location', q: 'Where is your office located?', a: 'Amalgated Bldg. Doña Carolina Bldg, J.P. Laurel Ave, Bo. Obrero, Davao City, Philippines.' },
  { id: 'response', q: 'How long does the response take?', a: 'Our team typically responds within one business day. For urgent matters, call us at +63 998 596 9288.' },
];

function newConvoId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      /* non-secure context or other failure */
    }
  }
  return `apmc-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getConvoId() {
  let id = sessionStorage.getItem('apmc_convo_id');
  if (!id) {
    id = newConvoId();
    sessionStorage.setItem('apmc_convo_id', id);
  }
  return id;
}

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('greeting');
  const [typing, setTyping] = useState(false);
  const [agentStep, setAgentStep] = useState(null);
  const [agentForm, setAgentForm] = useState({ name: '', email: '', concern: '' });
  const [faqFeedback, setFaqFeedback] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, name: '', email: '', comment: '' });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [unread, setUnread] = useState(0);
  const [leadCapture, setLeadCapture] = useState(null);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', company: '' });
  const socketRef = useRef(null);
  const convoId = useRef(getConvoId());
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const openRef = useRef(open);

  const getSourcePage = () => typeof window !== 'undefined' ? (window.location.pathname || window.location.href || '/') : '/';

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const socket = io({ autoConnect: false });
    socketRef.current = socket;

    socket.on('chat:history', (msgs) => {
      if (msgs.length > 0) {
        setMessages(msgs.map((m) => ({ ...m, time: m.created_at })));
        setMode('chat');
      }
    });

    socket.on('chat:message', (msg) => {
      setMessages((prev) => [...prev, { ...msg, time: msg.created_at }]);
      setTyping(false);
      if (!openRef.current && msg.sender !== 'user') {
        setUnread((n) => n + 1);
      }
    });

    socket.on('chat:typing', () => setTyping(true));
    socket.on('chat:typingStop', () => setTyping(false));
    socket.on('chat:requestLeadDetails', ({ inquiry_message }) => {
      setLeadCapture({ inquiry_message: inquiry_message || '' });
      setLeadForm({ name: '', email: '', phone: '', company: '' });
    });
    socket.on('chat:leadCaptured', () => {
      setLeadCapture(null);
      setLeadForm({ name: '', email: '', phone: '', company: '' });
    });

    socket.connect();
    socket.emit('visitor:join', { conversationId: convoId.current, source_page: getSourcePage() });

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, mode, agentStep, faqFeedback]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      if (mode === 'chat') inputRef.current?.focus();
    }
  }, [open, mode]);

  const addLocal = useCallback((sender, content, extras = {}) => {
    setMessages((prev) => [...prev, { sender, content, time: new Date().toISOString(), ...extras }]);
  }, []);

  const resetChat = useCallback(() => {
    const newId = newConvoId();
    sessionStorage.setItem('apmc_convo_id', newId);
    convoId.current = newId;
    setMessages([]);
    setMode('greeting');
    setAgentStep(null);
    setFaqFeedback(null);
    setFeedbackForm({ rating: 0, name: '', email: '', comment: '' });
    setFeedbackSubmitted(false);
    setAgentForm({ name: '', email: '', concern: '' });
    setLeadCapture(null);
    setLeadForm({ name: '', email: '', phone: '', company: '' });
    socketRef.current?.emit('visitor:join', { conversationId: newId, source_page: getSourcePage() });
  }, []);

  const sendVisitorMessage = useCallback((text) => {
    const content = text.trim();
    if (!content) return;
    socketRef.current?.emit('visitor:message', {
      conversationId: convoId.current,
      content,
      source_page: getSourcePage(),
    });
    setMode('chat');
  }, []);

  const handleQuickOption = useCallback((opt) => {
    if (opt.id === 'agent') {
      addLocal('user', opt.label);
      addLocal('ai', 'Would you like to connect with a live customer service representative?');
      setMode('agent');
      setAgentStep('confirm');
    } else if (opt.id === 'services') {
      sendVisitorMessage(opt.label);
    } else if (opt.id === 'faq') {
      addLocal('user', opt.label);
      addLocal('ai', 'Here are some frequently asked questions:');
      setMode('faq');
    } else if (opt.id === 'feedback') {
      addLocal('user', opt.label);
      addLocal('ai', "We'd love to hear your feedback! Please fill out the form below.");
      setMode('feedback');
      setFeedbackSubmitted(false);
      setFeedbackForm({ rating: 0, name: '', email: '', comment: '' });
    } else if (opt.id === 'track' || opt.id === 'report') {
      sendVisitorMessage(opt.label);
    } else {
      addLocal('user', opt.label);
      const prompts = {
        ask: "Sure! Go ahead and type your question — I'm here to help.",
        track: 'Please provide your reference number or describe your enquiry.',
        report: "I'm sorry to hear that. Please describe the problem.",
      };
      addLocal('ai', prompts[opt.id]);
      setMode('chat');
    }
  }, [addLocal, sendVisitorMessage]);

  const handleFaqSelect = useCallback((faq) => {
    addLocal('user', faq.q);
    addLocal('ai', faq.a);
    setFaqFeedback('pending');
  }, [addLocal]);

  const handleFaqFeedback = useCallback((helpful) => {
    setFaqFeedback(null);
    if (helpful) {
      addLocal('user', 'Yes 👍');
      addLocal('ai', "Glad I could help! Anything else you'd like to know?");
      setMode('faq');
    } else {
      addLocal('user', 'No, I need more help');
      addLocal('ai', 'Would you like to chat with a customer service representative?');
      setMode('agent');
      setAgentStep('confirm');
    }
  }, [addLocal]);

  const handleAgentConfirm = useCallback((yes) => {
    if (yes) {
      addLocal('user', 'Yes, connect me');
      addLocal('ai', 'Please fill in your details below so we can connect you.');
      setAgentStep('form');
    } else {
      addLocal('user', 'No, go back');
      addLocal('ai', 'No problem! Feel free to browse FAQs or ask me anything.');
      setMode('faq');
      setAgentStep(null);
    }
  }, [addLocal]);

  const handleAgentSubmit = useCallback((e) => {
    e.preventDefault();
    if (!agentForm.name || !agentForm.email || !agentForm.concern) return;
    socketRef.current?.emit('visitor:requestAgent', {
      conversationId: convoId.current,
      ...agentForm,
    });
    addLocal('user', `Name: ${agentForm.name}\nEmail: ${agentForm.email}\nConcern: ${agentForm.concern}`);
    setAgentStep(null);
    setMode('chat');
    setAgentForm({ name: '', email: '', concern: '' });
  }, [agentForm, addLocal]);

  const handleFeedbackSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!feedbackForm.rating || !feedbackForm.name.trim() || !feedbackForm.email.trim() || !feedbackForm.comment.trim()) return;
    const stars = '★'.repeat(feedbackForm.rating) + '☆'.repeat(5 - feedbackForm.rating);
    addLocal('user', `${stars}\n${feedbackForm.name ? `Name: ${feedbackForm.name}\n` : ''}${feedbackForm.email ? `Email: ${feedbackForm.email}\n` : ''}Feedback: ${feedbackForm.comment}`);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: convoId.current,
          rating: feedbackForm.rating,
          name: feedbackForm.name,
          email: feedbackForm.email,
          comment: feedbackForm.comment,
        }),
      });
    } catch { /* ignore */ }
    addLocal('ai', 'Thank you for your feedback! We really appreciate it. Is there anything else I can help you with?');
    setFeedbackSubmitted(true);
    setFeedbackForm({ rating: 0, name: '', email: '', comment: '' });
  }, [feedbackForm, addLocal]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    if (mode === 'greeting') setMode('chat');
    socketRef.current?.emit('visitor:message', {
      conversationId: convoId.current,
      content: text,
      source_page: getSourcePage(),
    });
    setInput('');
  }, [input, mode]);

  const handleLeadSubmit = useCallback((e) => {
    e.preventDefault();
    if (!leadForm.name?.trim() || !leadForm.email?.trim()) return;
    socketRef.current?.emit('visitor:leadDetails', {
      conversationId: convoId.current,
      name: leadForm.name.trim(),
      email: leadForm.email.trim(),
      phone: leadForm.phone?.trim() || '',
      company: leadForm.company?.trim() || '',
      inquiry_message: leadCapture?.inquiry_message || '',
      source_page: getSourcePage(),
    });
    setLeadCapture(null);
    setLeadForm({ name: '', email: '', phone: '', company: '' });
  }, [leadForm, leadCapture]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const showInput = mode === 'chat' || mode === 'greeting';

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>
            )}
          </>
        )}
      </button>

      {open && (
        <div className="chat-panel-enter fixed bottom-24 right-6 z-50 flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-brand-secondary/40 bg-white shadow-2xl sm:h-[560px]">
          <div className="flex items-center gap-2 border-b border-brand-secondary/30 bg-brand-primary px-3 py-3">
            {mode !== 'greeting' && (
              <button onClick={resetChat} className="rounded-md p-1 text-white/70 transition hover:bg-white/10 hover:text-white" title="Back to menu">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
            )}
            <img src={logo} alt="" className="h-9 w-9 rounded-full bg-white/20 object-contain p-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">APMC Assistant</p>
              <p className="text-xs text-white/70">Property & Leasing Support</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              {mode !== 'greeting' && (
                <button onClick={resetChat} className="rounded-md p-1 text-white/60 transition hover:bg-white/10 hover:text-white" title="New conversation">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 chat-scrollbar">
            {mode === 'greeting' && messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <img src={logo} alt="" className="h-16 w-16 rounded-full object-contain" />
                <div>
                  <p className="text-base font-semibold text-brand-text">Welcome to APMC!</p>
                  <p className="mt-1 text-sm text-brand-text/70">How can we help you today?</p>
                </div>
                <div className="mt-2 flex w-full flex-col gap-2">
                  {QUICK_OPTIONS.map((opt) => (
                    <button key={opt.id} onClick={() => handleQuickOption(opt)} className="flex w-full items-center gap-3 rounded-xl border border-brand-secondary/40 bg-brand-background-alt/60 px-4 py-3 text-left text-sm font-medium text-brand-text transition hover:border-brand-primary/40 hover:bg-brand-primary/5">
                      <span className="text-lg">{opt.icon}</span>{opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(mode !== 'greeting' || messages.length > 0) && (
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'rounded-br-md bg-brand-primary text-white'
                        : msg.sender === 'admin'
                          ? 'rounded-bl-md border border-emerald-200 bg-emerald-50 text-brand-text'
                          : 'rounded-bl-md border border-brand-secondary/30 bg-brand-background-alt text-brand-text'
                    }`}>
                      {msg.sender === 'admin' && msg.admin_name && (
                        <p className="mb-1 text-[10px] font-semibold text-emerald-600">{msg.admin_name}</p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={`mt-1 text-right text-[10px] ${msg.sender === 'user' ? 'text-white/60' : 'text-brand-text/40'}`}>
                        {formatTime(msg.time)}
                      </p>
                    </div>
                  </div>
                ))}

                {mode === 'faq' && !faqFeedback && (
                  <div className="flex flex-col gap-1.5">
                    {FAQ_ITEMS.map((faq) => (
                      <button key={faq.id} onClick={() => handleFaqSelect(faq)} className="w-full rounded-xl border border-brand-secondary/40 bg-brand-background-alt/60 px-4 py-2.5 text-left text-sm text-brand-text transition hover:border-brand-primary/40 hover:bg-brand-primary/5">{faq.q}</button>
                    ))}
                    <button onClick={() => { addLocal('ai', "Sure! Go ahead and type your question — I'm here to help."); setMode('chat'); }} className="mt-1 w-full rounded-xl border border-brand-primary/30 bg-brand-primary/5 px-4 py-2.5 text-left text-sm font-medium text-brand-primary transition hover:bg-brand-primary/10">💬 Back to Chat</button>
                    <button onClick={resetChat} className="w-full rounded-xl border border-brand-secondary/40 bg-white px-4 py-2.5 text-left text-sm font-medium text-brand-text/60 transition hover:bg-brand-background-alt">← Back to Main Menu</button>
                  </div>
                )}

                {faqFeedback === 'pending' && (
                  <div className="flex flex-col items-start gap-2">
                    <p className="rounded-2xl rounded-bl-md border border-brand-secondary/30 bg-brand-background-alt px-4 py-2.5 text-sm text-brand-text">Did this answer your question?</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleFaqFeedback(true)} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600">Yes 👍</button>
                      <button onClick={() => handleFaqFeedback(false)} className="rounded-xl border border-brand-secondary/50 px-4 py-2 text-sm font-medium text-brand-text transition hover:bg-brand-background-alt">No, I need more help</button>
                      <button onClick={() => { setFaqFeedback(null); addLocal('ai', "Sure! Go ahead and type your question — I'm here to help."); setMode('chat'); }} className="rounded-xl border border-brand-primary/30 bg-brand-primary/5 px-4 py-2 text-sm font-medium text-brand-primary transition hover:bg-brand-primary/10">💬 Back to Chat</button>
                    </div>
                  </div>
                )}

                {agentStep === 'confirm' && (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleAgentConfirm(true)} className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-primary-hover">Yes, connect me</button>
                    <button onClick={() => handleAgentConfirm(false)} className="rounded-xl border border-brand-secondary/50 px-4 py-2 text-sm font-medium text-brand-text transition hover:bg-brand-background-alt">No, go back</button>
                    <button onClick={() => { setAgentStep(null); addLocal('ai', "No problem! Go ahead and type your question."); setMode('chat'); }} className="rounded-xl border border-brand-primary/30 bg-brand-primary/5 px-4 py-2 text-sm font-medium text-brand-primary transition hover:bg-brand-primary/10">💬 Back to Chat</button>
                  </div>
                )}

                {agentStep === 'form' && (
                  <form onSubmit={handleAgentSubmit} className="w-full max-w-[90%] space-y-2.5 rounded-2xl rounded-bl-md border border-brand-secondary/30 bg-brand-background-alt p-4">
                    <input type="text" placeholder="Your name" value={agentForm.name} onChange={(e) => setAgentForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-brand-secondary/50 bg-white px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20" required />
                    <input type="email" placeholder="Your email" value={agentForm.email} onChange={(e) => setAgentForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-brand-secondary/50 bg-white px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20" required />
                    <textarea rows={2} placeholder="Describe your concern" value={agentForm.concern} onChange={(e) => setAgentForm((f) => ({ ...f, concern: e.target.value }))} className="w-full resize-none rounded-lg border border-brand-secondary/50 bg-white px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20" required />
                    <button type="submit" className="w-full rounded-lg bg-brand-primary py-2 text-sm font-semibold text-white transition hover:bg-brand-primary-hover">Submit & Connect</button>
                  </form>
                )}

                {leadCapture && (
                  <form onSubmit={handleLeadSubmit} className="w-full max-w-[90%] space-y-2.5 rounded-2xl rounded-bl-md border border-brand-secondary/30 bg-brand-background-alt p-4">
                    <p className="text-xs text-brand-text/70">Share your details so we can follow up:</p>
                    <input type="text" placeholder="Your name *" value={leadForm.name} onChange={(e) => setLeadForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-brand-secondary/50 bg-white px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20" required />
                    <input type="email" placeholder="Your email *" value={leadForm.email} onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-brand-secondary/50 bg-white px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20" required />
                    <input type="tel" placeholder="Phone" value={leadForm.phone} onChange={(e) => setLeadForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-lg border border-brand-secondary/50 bg-white px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20" />
                    <input type="text" placeholder="Company" value={leadForm.company} onChange={(e) => setLeadForm((f) => ({ ...f, company: e.target.value }))} className="w-full rounded-lg border border-brand-secondary/50 bg-white px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20" />
                    <button type="submit" className="w-full rounded-lg bg-brand-primary py-2 text-sm font-semibold text-white transition hover:bg-brand-primary-hover">Submit</button>
                  </form>
                )}

                {mode === 'feedback' && !feedbackSubmitted && (
                  <form onSubmit={handleFeedbackSubmit} className="w-full max-w-[90%] space-y-3 rounded-2xl rounded-bl-md border border-brand-secondary/30 bg-brand-background-alt p-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold text-brand-text/70">How would you rate your experience?</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackForm((f) => ({ ...f, rating: star }))}
                            className={`text-2xl transition-transform hover:scale-110 ${feedbackForm.rating >= star ? 'text-amber-400' : 'text-gray-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <input type="text" placeholder="Your name" value={feedbackForm.name} onChange={(e) => setFeedbackForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-brand-secondary/50 bg-white px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20" required />
                    <input type="email" placeholder="Your email" value={feedbackForm.email} onChange={(e) => setFeedbackForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-brand-secondary/50 bg-white px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20" required />
                    <textarea rows={3} placeholder="Tell us about your experience..." value={feedbackForm.comment} onChange={(e) => setFeedbackForm((f) => ({ ...f, comment: e.target.value }))} className="w-full resize-none rounded-lg border border-brand-secondary/50 bg-white px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20" required />
                    <button type="submit" disabled={!feedbackForm.rating} className="w-full rounded-lg bg-brand-primary py-2 text-sm font-semibold text-white transition hover:bg-brand-primary-hover disabled:opacity-40">Submit Feedback</button>
                  </form>
                )}

                {typing && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-brand-secondary/30 bg-brand-background-alt px-4 py-3">
                      <span className="chat-dot h-2 w-2 rounded-full bg-brand-primary/60" />
                      <span className="chat-dot h-2 w-2 rounded-full bg-brand-primary/60 [animation-delay:0.15s]" />
                      <span className="chat-dot h-2 w-2 rounded-full bg-brand-primary/60 [animation-delay:0.3s]" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {showInput ? (
            <div className="border-t border-brand-secondary/30 bg-white px-3 py-3">
              <div className="flex items-end gap-2">
                <textarea ref={inputRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." className="max-h-24 flex-1 resize-none rounded-xl border border-brand-secondary/50 bg-brand-background-alt/60 px-4 py-2.5 text-sm text-brand-text outline-none transition placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20" />
                <button onClick={sendMessage} disabled={!input.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white transition hover:bg-brand-primary-hover disabled:opacity-40" aria-label="Send">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-brand-text/40">Powered by AI · Responses may not always be accurate</p>
            </div>
          ) : mode !== 'greeting' && (
            <div className="border-t border-brand-secondary/30 bg-white px-3 py-2.5">
              <button
                onClick={() => { setFaqFeedback(null); setAgentStep(null); addLocal('ai', "Sure! Go ahead and type your question — I'm here to help."); setMode('chat'); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary/10 px-4 py-2.5 text-sm font-medium text-brand-primary transition hover:bg-brand-primary/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Back to Chat
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
