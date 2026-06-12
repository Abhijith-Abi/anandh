"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken } from './utils/api';
import { BrainCircuit, ShieldAlert, FileLineChart, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      router.push('/dashboard');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-radial from-slate-900 via-zinc-950 to-black text-zinc-100 font-sans">
      
      {/* Navbar branding */}
      <header className="flex h-20 items-center justify-between px-6 lg:px-12 border-b border-zinc-800 bg-zinc-950/20 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/25">
            AP
          </div>
          <span className="font-extrabold text-xl tracking-tight">Academic Analytics</span>
        </div>
        <Link 
          href="/login" 
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 shadow-md shadow-blue-500/10"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 mb-6 animate-pulse">
          <BrainCircuit size={14} />
          <span>Random Forest Predictive Engine Active</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Student Academic <br />
          <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Performance Analytics
          </span>
        </h1>
        
        <p className="mt-6 text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Leverage Machine Learning to predict student outcomes, identify at-risk learners, generate personalized study recommendations, and access institutional statistics.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-500 shadow-xl shadow-blue-500/15"
          >
            Enter Portal Dashboard
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-4">
              <BrainCircuit size={20} />
            </div>
            <h3 className="font-bold text-base text-white">Predictive Modeling</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Trained Classifier predicting student outcomes based on study schedules, internal marks, and engagement cohorts.
            </p>
          </div>
          
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 mb-4">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-bold text-base text-white">Risk Profiling</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Real-time classification sorting student profiles into risk indexes to execute targeted interventions.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
              <FileLineChart size={20} />
            </div>
            <h3 className="font-bold text-base text-white">Detailed Reporting</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Download academic summary sheets in PDF or CSV formats for records or departmental distribution.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-zinc-650 border-t border-zinc-900">
        © 2026 Academic Analytics Inc. All rights reserved.
      </footer>
    </div>
  );
}
