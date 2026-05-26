import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import AdminChatPage from '../AdminChatPage.jsx';

export default function AdminCRM() {
  const navigate = useNavigate();

  const handleChatLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_username');
    navigate('/portal/login', { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Pipeline</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">CRM & Chat</h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-text-muted dark:text-slate-400">
            Track sales opportunities and jump back into existing customer conversations.
          </p>
        </div>
      </div>

      <div className="glass-card flex flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/15 dark:text-brand-accent">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-brand-primary dark:text-white">Chat inbox</h3>
            <p className="mt-1 text-sm text-brand-text-muted dark:text-slate-400">
              Open previous client chats, review unread messages, and continue support conversations.
            </p>
          </div>
        </div>
        <AdminChatPage embedded onLogout={handleChatLogout} />
      </div>
    </div>
  );
}
