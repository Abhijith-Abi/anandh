"use client";

import React, { useState, useEffect } from 'react';
import { request } from '../utils/api';
import { 
  Users, 
  GraduationCap, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Award,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

interface DashboardData {
  cards: {
    total_students: number;
    excellent_students: number;
    good_students: number;
    average_students: number;
    poor_students: number;
    high_risk_students: number;
  };
  charts: {
    performance_pie: Array<{ name: string; value: number }>;
    attendance_bar: Array<{ range: string; count: number }>;
    gpa_trend: Array<{ semester: string; gpa: number }>;
    risk_donut: Array<{ name: string; value: number }>;
    study_hours_scatter: Array<{ study_hours: number; gpa: number; name: string; grade: string }>;
    department_bar: Array<{ department: string; avg_gpa: number; avg_attendance: number; student_count: number }>;
  };
}

export default function DashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await request('/dashboard/');
      if (!res.ok) throw new Error('Failed to fetch dashboard analytics');
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error connecting to the API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = {
    Excellent: '#10B981', // emerald
    Good: '#3B82F6',      // blue
    Average: '#F59E0B',   // amber
    Poor: '#EF4444',      // red
    
    // Risk colors
    'Low Risk': '#10B981',
    'Medium Risk': '#F59E0B',
    'High Risk': '#EF4444',
  };

  const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
  const DONUT_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>

        {/* Charts Skeleton Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-bold">Analytics Unavailable</h3>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm">{error || "Could not retrieve system dashboard details."}</p>
        <button 
          onClick={fetchDashboardData} 
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-500/10"
        >
          Try Again
        </button>
      </div>
    );
  }

  const cardsList = [
    { title: 'Total Students', value: data.cards.total_students, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Excellent Performance', value: data.cards.excellent_students, icon: Award, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Good Performance', value: data.cards.good_students, icon: GraduationCap, color: 'text-indigo-500 bg-indigo-500/10' },
    { title: 'Average Performance', value: data.cards.average_students, icon: BookOpen, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Poor Performance', value: data.cards.poor_students, icon: Clock, color: 'text-rose-500 bg-rose-500/10' },
    { title: 'High Risk Students', value: data.cards.high_risk_students, icon: AlertTriangle, color: 'text-red-500 bg-red-500/10 border border-red-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Academic Analytics Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Real-time student predictive insights and overview</p>
      </div>

      {/* Grid of Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cardsList.map((card, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div className="overflow-hidden">
              <span className="block truncate text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {card.title}
              </span>
              <span className="block text-2xl font-extrabold mt-1 tracking-tight">
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid of Visualization Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        
        {/* 1. Performance Distribution Pie Chart */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 mb-4">Grade Prediction Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.performance_pie}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.charts.performance_pie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderColor: '#27272a',
                    borderRadius: '8px', 
                    color: '#f4f4f5' 
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Attendance Bar Chart */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 mb-4">Attendance Cohort Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.attendance_bar} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="range" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderColor: '#27272a',
                    borderRadius: '8px', 
                    color: '#f4f4f5' 
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Risk Analysis Donut Chart */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 mb-4">Risk Profile Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.risk_donut}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.charts.risk_donut.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderColor: '#27272a',
                    borderRadius: '8px', 
                    color: '#f4f4f5' 
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. GPA Trend Line Chart */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 xl:col-span-2">
          <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 mb-4">GPA Performance Trend Across Semesters</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.gpa_trend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="semester" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 10]} stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderColor: '#27272a',
                    borderRadius: '8px', 
                    color: '#f4f4f5' 
                  }}
                />
                <Line type="monotone" dataKey="gpa" stroke="#10B981" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Study Hours vs GPA Scatter Chart */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 mb-4">Study Hours vs. GPA Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" dataKey="study_hours" name="Study Hours" unit=" hrs" stroke="#71717a" fontSize={11} />
                <YAxis type="number" dataKey="gpa" name="GPA" domain={[2, 10]} stroke="#71717a" fontSize={11} />
                <ZAxis type="category" dataKey="grade" name="Grade" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderColor: '#27272a',
                    borderRadius: '8px', 
                    color: '#f4f4f5' 
                  }}
                  formatter={(value, name) => [value, name]}
                />
                <Scatter name="Students" data={data.charts.study_hours_scatter} fill="#8884d8">
                  {data.charts.study_hours_scatter.map((entry, index) => {
                    const gradeColor = COLORS[entry.grade as keyof typeof COLORS] || '#8884d8';
                    return <Cell key={`cell-${index}`} fill={gradeColor} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Department-wise Performance Graph */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 xl:col-span-3">
          <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 mb-4">Department-wise Metrics Comparatives</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.department_bar} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="department" stroke="#71717a" fontSize={10} angle={-15} textAnchor="end" interval={0} height={50} />
                <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" fontSize={10} domain={[0, 10]} label={{ value: 'Avg GPA', angle: -90, position: 'insideLeft', offset: 0, fill: '#3B82F6' }} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#10B981" fontSize={10} domain={[0, 100]} label={{ value: 'Avg Attendance %', angle: 90, position: 'insideRight', offset: 10, fill: '#10B981' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderColor: '#27272a',
                    borderRadius: '8px', 
                    color: '#f4f4f5' 
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar yAxisId="left" dataKey="avg_gpa" name="Avg GPA" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="right" dataKey="avg_attendance" name="Avg Attendance %" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
