"use client";

import React, { useState, useEffect } from 'react';
import { request } from '../../utils/api';
import { 
  BrainCircuit, 
  HelpCircle, 
  ChevronRight, 
  AlertTriangle, 
  Award, 
  ShieldCheck, 
  BookOpen, 
  TrendingUp,
  Cpu
} from 'lucide-react';

interface PredictionResult {
  predicted_grade: string;
  risk_level: string;
  recommendations: string[];
}

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
}

export default function PredictiveAnalyzer() {
  // Input fields
  const [attendance, setAttendance] = useState(82);
  const [internal, setInternal] = useState(70);
  const [assignment, setAssignment] = useState(75);
  const [quiz, setQuiz] = useState(65);
  const [studyHours, setStudyHours] = useState(14);
  const [gpa, setGpa] = useState(7.2);

  // States
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true);
      const res = await request('/predict/');
      if (!res.ok) throw new Error('Could not fetch model metrics');
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    const bodyData = {
      attendance_percentage: attendance,
      internal_marks: internal,
      assignment_marks: assignment,
      quiz_marks: quiz,
      study_hours: studyHours,
      gpa: gpa
    };

    try {
      const res = await request('/predict/', {
        method: 'POST',
        body: JSON.stringify(bodyData)
      });
      if (!res.ok) throw new Error('Prediction API request failed');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error processing prediction');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return {
          bg: 'bg-red-500/10 border-red-500/20 text-red-400',
          badge: 'bg-red-500 text-white',
          desc: 'Urgent intervention required. High probability of academic probation/failure.'
        };
      case 'Medium':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          badge: 'bg-amber-500 text-zinc-950',
          desc: 'Monitor performance closely. Student is demonstrating early warning signs.'
        };
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          badge: 'bg-emerald-500 text-white',
          desc: 'Academic standing is solid. Low threat index.'
        };
    }
  };

  const getGradeCard = (grade: string) => {
    switch (grade) {
      case 'Excellent':
        return {
          border: 'border-emerald-500/30',
          bg: 'from-emerald-500/10 to-emerald-500/20',
          text: 'text-emerald-400',
          shadow: 'shadow-emerald-500/10'
        };
      case 'Good':
        return {
          border: 'border-blue-500/30',
          bg: 'from-blue-500/10 to-blue-500/20',
          text: 'text-blue-400',
          shadow: 'shadow-blue-500/10'
        };
      case 'Average':
        return {
          border: 'border-amber-500/30',
          bg: 'from-amber-500/10 to-amber-500/20',
          text: 'text-amber-400',
          shadow: 'shadow-amber-500/10'
        };
      default:
        return {
          border: 'border-red-500/30',
          bg: 'from-red-500/10 to-red-500/20',
          text: 'text-red-400',
          shadow: 'shadow-red-500/10'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Predictive Analyzer</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Simulate student profile metrics to predict academic standing and generate actionable remedies
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Input Parameters Panel */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center gap-2 border-b border-zinc-150 pb-4 mb-6 dark:border-zinc-800">
            <Cpu className="text-blue-500" size={20} />
            <h3 className="font-bold text-base">Simulation Parameters</h3>
          </div>

          <form onSubmit={handlePredict} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Attendance slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Attendance Percentage</span>
                  <span className="font-bold text-blue-500">{attendance}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={attendance}
                  onChange={(e) => setAttendance(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-zinc-200 rounded-lg dark:bg-zinc-800 cursor-pointer"
                />
              </div>

              {/* Weekly Study Hours slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Weekly Study Hours</span>
                  <span className="font-bold text-blue-500">{studyHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-zinc-200 rounded-lg dark:bg-zinc-800 cursor-pointer"
                />
              </div>

              {/* Internal marks slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Internal Marks (out of 100)</span>
                  <span className="font-bold text-blue-500">{internal}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={internal}
                  onChange={(e) => setInternal(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-zinc-200 rounded-lg dark:bg-zinc-800 cursor-pointer"
                />
              </div>

              {/* Assignment marks slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Assignment Marks (out of 100)</span>
                  <span className="font-bold text-blue-500">{assignment}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={assignment}
                  onChange={(e) => setAssignment(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-zinc-200 rounded-lg dark:bg-zinc-800 cursor-pointer"
                />
              </div>

              {/* Quiz Marks slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Quiz Marks (out of 100)</span>
                  <span className="font-bold text-blue-500">{quiz}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={quiz}
                  onChange={(e) => setQuiz(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-zinc-200 rounded-lg dark:bg-zinc-800 cursor-pointer"
                />
              </div>

              {/* GPA input slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Cumulative GPA (out of 10)</span>
                  <span className="font-bold text-blue-500">{gpa.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="10.0"
                  step="0.05"
                  value={gpa}
                  onChange={(e) => setGpa(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-zinc-200 rounded-lg dark:bg-zinc-800 cursor-pointer"
                />
              </div>
            </div>

            <div className="border-t border-zinc-150 pt-4 dark:border-zinc-800">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-white transition hover:bg-blue-500 disabled:opacity-50 shadow-lg shadow-blue-500/10"
              >
                <BrainCircuit size={18} />
                {loading ? 'Evaluating Model...' : 'Calculate Prediction'}
              </button>
            </div>
          </form>
        </div>

        {/* Classifier Performance Metrics Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-zinc-150 pb-4 mb-6 dark:border-zinc-800">
              <ShieldCheck className="text-emerald-500" size={20} />
              <h3 className="font-bold text-base">Random Forest Model Performance</h3>
            </div>

            {metricsLoading ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2">
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                ))}
              </div>
            ) : metrics ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-850">
                  <span className="text-zinc-500 font-medium">Accuracy</span>
                  <span className="font-bold text-emerald-500">{(metrics.accuracy * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-850">
                  <span className="text-zinc-500 font-medium">Precision (Weighted)</span>
                  <span className="font-bold text-emerald-500">{(metrics.precision * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-850">
                  <span className="text-zinc-500 font-medium">Recall (Weighted)</span>
                  <span className="font-bold text-emerald-500">{(metrics.recall * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">F1 Score (Weighted)</span>
                  <span className="font-bold text-emerald-500">{(metrics.f1_score * 100).toFixed(2)}%</span>
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 text-xs">Model metrics currently unavailable.</p>
            )}
          </div>
          
          <div className="mt-6 border-t border-zinc-150 pt-4 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Classifier Info</span>
            <span className="block text-xs text-zinc-500">
              The algorithm evaluates weekly logs, grades, and engagement metrics to classify students with high confidence intervals.
            </span>
          </div>
        </div>
      </div>

      {/* Prediction Output Results */}
      {result && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 animate-fade-in">
          
          {/* Main Grade & Risk Cards */}
          <div className="space-y-6">
            
            {/* Predicted Grade Card */}
            {(() => {
              const style = getGradeCard(result.predicted_grade);
              return (
                <div className={`rounded-2xl border ${style.border} bg-linear-to-br ${style.bg} p-6 shadow-lg ${style.shadow}`}>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Predicted Academic Grade</span>
                  <div className="flex items-center justify-between mt-4">
                    <h2 className={`text-4xl font-black ${style.text}`}>{result.predicted_grade}</h2>
                    <Award className={`h-12 w-12 ${style.text}`} />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 font-medium">
                    Calculated output based on current learning capabilities and performance statistics.
                  </p>
                </div>
              );
            })()}

            {/* Risk profile alert banner */}
            {(() => {
              const risk = getRiskColor(result.risk_level);
              return (
                <div className={`rounded-2xl border p-6 ${risk.bg}`}>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Risk Severity Level</span>
                  <div className="flex items-center gap-3 mt-4">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${risk.badge}`}>
                      {result.risk_level} Risk
                    </span>
                  </div>
                  <p className="text-sm text-zinc-350 mt-3 font-medium">
                    {risk.desc}
                  </p>
                </div>
              );
            })()}

          </div>

          {/* Actionable Recommendations list */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Prescribed Academic Interventions</span>
            
            <div className="space-y-4">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-500/10 text-blue-500 mt-0.5">
                    <ChevronRight size={14} />
                  </div>
                  <span className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                    {rec}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500 text-sm">
          {error}
        </div>
      )}

    </div>
  );
}
