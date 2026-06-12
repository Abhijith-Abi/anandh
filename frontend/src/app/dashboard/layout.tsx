"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BrainCircuit, 
  FileDown, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User as UserIcon 
} from 'lucide-react';
import { getUserInfo, clearTokens } from '../utils/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState({ name: 'User', role: 'TEACHER' });

  useEffect(() => {
    // Retrieve logged-in user context
    const userInfo = getUserInfo();
    setUser(userInfo);
    
    // Load theme setting
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    clearTokens();
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/dashboard/students', icon: Users },
    { name: 'Predictive Analyzer', href: '/dashboard/predict', icon: BrainCircuit },
    { name: 'Reports & Export', href: '/dashboard/reports', icon: FileDown },
  ];

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      
      {/* Mobile Top Bar */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">AP</div>
          <span className="font-semibold text-lg">Academic Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme} 
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:flex">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2 border-b border-zinc-200 px-6 dark:border-zinc-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20">
            AP
          </div>
          <span className="font-bold text-lg tracking-tight">Academic Analytics</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <item.icon size={18} className={active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400">
              <UserIcon size={18} />
            </div>
            <div className="flex-1 overflow-hidden">
              <span className="block truncate text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">{user.role}</span>
            </div>
            <button 
              onClick={toggleTheme} 
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-850 transition"
              title="Toggle Light/Dark Theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-zinc-800 dark:hover:bg-red-950/20"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Sidebar - Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-col bg-white py-4 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-6 pb-4 border-b border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">AP</div>
                <span className="font-bold text-lg">Academic Portal</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1 px-4 py-6">
              {navigation.map((item) => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      active 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <item.icon size={18} className={active ? 'text-white' : 'text-zinc-400'} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-zinc-100 p-4 dark:border-zinc-900">
              <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  <UserIcon size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <span className="block truncate text-sm font-semibold">{user.name}</span>
                  <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">{user.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-zinc-800 dark:hover:bg-red-950/20"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
