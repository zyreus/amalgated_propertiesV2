import React from 'react';
import { Download } from 'lucide-react';
import { clientTables } from '../../data/mockPortal.js';

export default function ClientDocuments() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Files</p>
        <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Documents</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clientTables.documents.map((doc) => (
          <div key={doc.name} className="glass-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-brand-primary dark:text-white">{doc.name}</h3>
                <p className="mt-1 text-sm text-brand-text-muted dark:text-slate-400">{doc.type} - {doc.property}</p>
              </div>
              <button className="rounded-full p-2 text-brand-primary hover:bg-brand-50 dark:text-brand-accent dark:hover:bg-brand-800/50" aria-label={`Download ${doc.name}`}>
                <Download className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-brand-accent">Updated {doc.updated}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
