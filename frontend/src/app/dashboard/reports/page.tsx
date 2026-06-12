"use client";

import React, { useState } from 'react';
import { request } from '../../utils/api';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  AlertCircle,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<'pdf' | 'csv' | null>(null);
  const [error, setError] = useState('');

  const handleDownload = async (type: 'pdf' | 'csv') => {
    setError('');
    setDownloading(type);
    
    try {
      const res = await request(`/reports/${type}/`);
      if (!res.ok) throw new Error(`Failed to generate ${type.toUpperCase()} report.`);
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', type === 'pdf' ? 'academic_performance_report.pdf' : 'student_academic_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'An error occurred during report download.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Academic Reports & Exports</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Export data summaries and detailed profiling indicators for institutional compliance or offline audits
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* PDF Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Academic Risk Summary (PDF)</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm leading-relaxed">
                Generates a formal, printable PDF document containing enrollment parameters, distribution figures, 
                and a list identifying high-risk students requiring immediate counseling or remedial interventions.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <FileCheck size={14} className="text-emerald-500" />
                <span>Format: PDF Document (A4/Letter size)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ShieldAlert size={14} className="text-amber-500" />
                <span>Contains: Student ID, Name, Department, Semester, GPA, and Risk Tagging</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-zinc-150 pt-4 dark:border-zinc-800">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading !== null}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50 shadow-lg shadow-red-500/10"
            >
              <Download size={16} />
              {downloading === 'pdf' ? 'Generating PDF...' : 'Download PDF Report'}
            </button>
          </div>
        </div>

        {/* CSV Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Full Student Directory Ledger (CSV)</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm leading-relaxed">
                Exports the entire student record directory database to a comma-separated format. Perfect for 
                loading into Microsoft Excel, Google Sheets, or custom institutional databases.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <FileCheck size={14} className="text-emerald-500" />
                <span>Format: Comma-Separated Values (.csv)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-450">
                <FileCheck size={14} className="text-emerald-500" />
                <span>Fields: 13 columns containing complete mark sheets and study logs</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-150 pt-4 dark:border-zinc-800">
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloading !== null}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 shadow-lg shadow-emerald-500/10"
            >
              <Download size={16} />
              {downloading === 'csv' ? 'Generating CSV...' : 'Download CSV Dataset'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
