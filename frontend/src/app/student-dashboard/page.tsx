"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap, LogOut, TrendingUp, BookOpen, ClipboardList,
  Award, AlertTriangle, Clock, BarChart2, Star, User,
  ChevronRight, Activity
} from 'lucide-react';

interface StudentProfile {
  id: string;
  student_id: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  attendance_percentage: string;
  internal_marks: string;
  assignment_marks: string;
  quiz_marks: string;
  study_hours: string;
  gpa: string;
  risk_level: string;
  predicted_grade: string;
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, sub, color, progress, max,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  color: string; progress?: number; max?: number;
}) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 overflow-hidden group hover:bg-white/8 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${color}`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} bg-opacity-20`}>
          <Icon size={20} className="text-white" />
        </div>
        {sub && <span className="text-xs text-slate-500 font-medium">{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">{label}</p>
      {progress !== undefined && max !== undefined && (
        <ProgressBar value={progress} max={max} color={color} />
      )}
    </div>
  );
}

const RISK_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  High:   { color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/30',    icon: AlertTriangle, label: 'High Risk' },
  Medium: { color: 'text-amber-400',  bg: 'bg-amber-500/15 border-amber-500/30', icon: Activity,      label: 'Medium Risk' },
  Low:    { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: Star,     label: 'Low Risk' },
};

const GRADE_CONFIG: Record<string, { color: string; bg: string }> = {
  Excellent: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  Good:      { color: 'text-blue-400',    bg: 'bg-blue-500/15 border-blue-500/30' },
  Average:   { color: 'text-amber-400',   bg: 'bg-amber-500/15 border-amber-500/30' },
  Poor:      { color: 'text-red-400',     bg: 'bg-red-500/15 border-red-500/30' },
};

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('Student');

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'STUDENT') {
      router.push('/student-login');
      return;
    }

    setUserName(localStorage.getItem('user_name') || 'Student');

    try {
      const res = await fetch('/api-proxy/student/profile/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 401) {
        localStorage.clear();
        router.push('/student-login');
        return;
      }

      if (!res.ok) throw new Error('Failed to load your profile');
      const data = await res.json();
      setStudent(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/student-login');
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1528] to-[#060d1a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 mb-4 animate-pulse">
            <GraduationCap size={30} className="text-blue-400" />
          </div>
          <p className="text-slate-400 text-sm animate-pulse">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1528] to-[#060d1a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-400 text-5xl mb-4">⚠</div>
          <p className="text-white font-bold text-lg mb-2">Could not load your profile</p>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchProfile}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const att = parseFloat(student.attendance_percentage);
  const gpa = parseFloat(student.gpa);
  const internal = parseFloat(student.internal_marks);
  const assignment = parseFloat(student.assignment_marks);
  const quiz = parseFloat(student.quiz_marks);
  const studyHours = parseFloat(student.study_hours);

  const risk = RISK_CONFIG[student.risk_level] || RISK_CONFIG['Low'];
  const grade = GRADE_CONFIG[student.predicted_grade] || GRADE_CONFIG['Average'];
  const RiskIcon = risk.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1528] to-[#060d1a] text-white">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwIiBzdHJva2U9IiMxZTI5M2YiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9nPjwvc3ZnPg==')] opacity-30 pointer-events-none" />

      {/* Nav */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">Academic Portal</h1>
              <p className="text-xs text-slate-500 mt-0.5">Student Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
              <div className="h-6 w-6 rounded-lg bg-blue-600/30 flex items-center justify-center">
                <User size={12} className="text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-slate-300">{userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Profile Hero Card */}
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-blue-600/10 backdrop-blur-sm p-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-600/30">
              {student.name.charAt(0).toUpperCase()}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white">{student.name}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{student.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                  <BookOpen size={11} /> {student.department}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                  <ChevronRight size={11} /> Semester {student.semester}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                  ID: {student.student_id}
                </span>
              </div>
            </div>
            {/* Status Badges */}
            <div className="flex flex-wrap sm:flex-col gap-2 sm:items-end">
              <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${risk.bg} ${risk.color}`}>
                <RiskIcon size={13} /> {risk.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${grade.bg} ${grade.color}`}>
                <Award size={13} /> {student.predicted_grade} Grade
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Academic Overview</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={TrendingUp} label="GPA / CGPA" value={gpa.toFixed(2)}
              sub="/ 10.0" color="bg-blue-500" progress={gpa} max={10}
            />
            <StatCard
              icon={BarChart2} label="Attendance" value={`${att.toFixed(1)}%`}
              sub={att >= 85 ? '✓ Good' : att >= 70 ? '⚠ Average' : '✗ Low'}
              color={att >= 85 ? 'bg-emerald-500' : att >= 70 ? 'bg-amber-500' : 'bg-red-500'}
              progress={att} max={100}
            />
            <StatCard
              icon={ClipboardList} label="Internal Marks" value={internal.toFixed(1)}
              sub="/ 100" color="bg-indigo-500" progress={internal} max={100}
            />
            <StatCard
              icon={Clock} label="Study Hours/Week" value={`${studyHours.toFixed(1)}h`}
              sub={studyHours >= 15 ? 'Excellent' : studyHours >= 10 ? 'Moderate' : 'Low'}
              color="bg-violet-500" progress={studyHours} max={30}
            />
          </div>
        </div>

        {/* Marks Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Score Breakdown */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
              <ClipboardList size={16} className="text-blue-400" />
              Score Breakdown
            </h3>
            <div className="space-y-5">
              {[
                { label: 'Internal Marks', value: internal, max: 100, color: 'bg-blue-500' },
                { label: 'Assignment Marks', value: assignment, max: 100, color: 'bg-indigo-500' },
                { label: 'Quiz Marks', value: quiz, max: 100, color: 'bg-violet-500' },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-slate-400">{label}</span>
                    <span className="text-sm font-bold text-white">
                      {value.toFixed(1)} <span className="text-slate-600 text-xs font-normal">/ {max}</span>
                    </span>
                  </div>
                  <ProgressBar value={value} max={max} color={color} />
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
              <Star size={16} className="text-amber-400" />
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'GPA', value: `${gpa.toFixed(2)} / 10`, icon: TrendingUp, color: 'text-blue-400 bg-blue-500/20' },
                { label: 'Attendance', value: `${att.toFixed(1)}%`, icon: BarChart2, color: 'text-emerald-400 bg-emerald-500/20' },
                { label: 'Assignments', value: `${assignment.toFixed(1)} / 100`, icon: ClipboardList, color: 'text-indigo-400 bg-indigo-500/20' },
                { label: 'Quiz Score', value: `${quiz.toFixed(1)} / 100`, icon: BookOpen, color: 'text-violet-400 bg-violet-500/20' },
                { label: 'Study Hours', value: `${studyHours.toFixed(1)}h / week`, icon: Clock, color: 'text-amber-400 bg-amber-500/20' },
                { label: 'Internals', value: `${internal.toFixed(1)} / 100`, icon: Activity, color: 'text-cyan-400 bg-cyan-500/20' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition">
                  <div className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${color} mb-2`}>
                    <Icon size={13} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{label}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk & Predicted Grade Detail */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-slate-400" />
            Academic Risk Assessment
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Risk card */}
            <div className={`flex-1 rounded-xl border p-4 ${risk.bg}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-current/10`}>
                  <RiskIcon size={20} className={risk.color} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Risk Level</p>
                  <p className={`text-lg font-bold ${risk.color}`}>{risk.label}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {student.risk_level === 'High'
                  ? 'Your attendance or GPA needs urgent attention. Please consult your academic advisor.'
                  : student.risk_level === 'Medium'
                  ? 'You\'re in a moderate range. Improving attendance and study hours can help you move to low risk.'
                  : 'Great work! Keep maintaining your current performance to stay on track.'}
              </p>
            </div>
            {/* Predicted grade card */}
            <div className={`flex-1 rounded-xl border p-4 ${grade.bg}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center">
                  <Award size={20} className={grade.color} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Predicted Grade</p>
                  <p className={`text-lg font-bold ${grade.color}`}>{student.predicted_grade}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {student.predicted_grade === 'Excellent'
                  ? 'Outstanding! You\'re predicted to perform excellently this semester.'
                  : student.predicted_grade === 'Good'
                  ? 'You\'re on track for a good grade. A bit more effort can push you to excellent.'
                  : student.predicted_grade === 'Average'
                  ? 'You\'re predicted to be average. Focus on weak areas to improve your grade.'
                  : 'Your predicted grade needs improvement. Seek help from teachers and study consistently.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-700 pb-4">
          Academic Portal — Powered by Academic Analytics System
        </p>
      </main>
    </div>
  );
}
