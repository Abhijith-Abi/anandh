"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveTokens, saveUser, request, clearTokens } from '../utils/api';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clear any leftover tokens when entering login
    clearTokens();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const data = await response.json();
      saveTokens(data.access, data.refresh);

      // Fetch user profile info to save role and name
      const profileRes = await request('/profile/');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        saveUser(profileData.username, profileData.role);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial from-slate-900 via-zinc-950 to-black p-4 text-zinc-100 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/30">
            AP
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Academic Portal
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to access student analytics
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-xs">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/50 p-3 text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., admin or teacher"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/50 p-3 text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Demo Login Details Below</span>
            <Link
              href="/forgot-password"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-blue-600 p-3 font-semibold text-white shadow-lg transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-zinc-800 pt-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Seed Credentials
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
              <span className="block font-bold text-blue-400">Admin Account</span>
              <span className="block text-zinc-400 mt-1">User: <code className="text-white bg-zinc-800 px-1 rounded">admin</code></span>
              <span className="block text-zinc-400">Pass: <code className="text-white bg-zinc-800 px-1 rounded">Password123</code></span>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
              <span className="block font-bold text-teal-400">Teacher Account</span>
              <span className="block text-zinc-400 mt-1">User: <code className="text-white bg-zinc-800 px-1 rounded">teacher</code></span>
              <span className="block text-zinc-400">Pass: <code className="text-white bg-zinc-800 px-1 rounded">Password123</code></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
