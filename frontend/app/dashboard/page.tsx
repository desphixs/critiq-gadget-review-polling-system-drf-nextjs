'use client';

import React from 'react';
import DashboardWrapper from '@/components/dashboard/DashboardWrapper';
import { 
  Milestone, Users, DollarSign, Activity, 
  ArrowUpRight, ArrowDownRight, Zap, PlayCircle 
} from 'lucide-react';

/**
 * DASHBOARD OVERVIEW PAGE
 * 
 * Analogy:
 * Think of this like the main gauge cluster inside a race car.
 * It reads out the real-time speed, RPM, and engine temperature (Total Revenue, Active Users, conversion ratios)
 * so the driver knows exactly how the car is performing at a single glance!
 */
export default function DashboardOverviewPage() {
  return (
    <DashboardWrapper>
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* Title Heading */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back, Destiny. Monitor your SaaS performance, deployments, and stats.
          </p>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card: Total Revenue */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Monthly Income
              </span>
              <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-extrabold text-zinc-950 dark:text-white">$14,249.50</h2>
              <span className="flex items-center text-xs font-bold text-green-500">
                <ArrowUpRight size={14} className="mr-0.5" /> +12.4%
              </span>
            </div>
          </div>

          {/* Card: Active Users */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Active Users
              </span>
              <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <Users size={16} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-extrabold text-zinc-950 dark:text-white">1,842</h2>
              <span className="flex items-center text-xs font-bold text-green-500">
                <ArrowUpRight size={14} className="mr-0.5" /> +4.8%
              </span>
            </div>
          </div>

          {/* Card: Active Projects */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Total Projects
              </span>
              <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <Milestone size={16} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-extrabold text-zinc-950 dark:text-white">28</h2>
              <span className="flex items-center text-xs font-bold text-zinc-400">
                Stable
              </span>
            </div>
          </div>

          {/* Card: API Conversion Rate */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Conversion Rate
              </span>
              <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <Activity size={16} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-extrabold text-zinc-950 dark:text-white">3.48%</h2>
              <span className="flex items-center text-xs font-bold text-red-500">
                <ArrowDownRight size={14} className="mr-0.5" /> -0.2%
              </span>
            </div>
          </div>

        </div>

        {/* Content Splitting Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Activity Chart Card */}
          <div className="lg:col-span-2 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">Recent Deployments</h3>
                <p className="text-xs text-zinc-500">Real-time CI/CD pipeline triggers and branches.</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                <Zap size={10} className="text-amber-500 animate-pulse" /> Live Server
              </span>
            </div>

            {/* Mock pipeline rows */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/20">
                <div className="flex items-center gap-3">
                  <PlayCircle className="text-emerald-500" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-zinc-950 dark:text-white">production-build-98d</h4>
                    <p className="text-xs text-zinc-500">main branch • by Destiny Frank</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                  Success
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/20">
                <div className="flex items-center gap-3">
                  <PlayCircle className="text-emerald-500" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-zinc-950 dark:text-white">staging-deploy-382a</h4>
                    <p className="text-xs text-zinc-500">dev branch • by subagent-bot</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                  Success
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/20">
                <div className="flex items-center gap-3">
                  <PlayCircle className="text-amber-500 animate-spin" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-zinc-950 dark:text-white">feature-otp-inputs</h4>
                    <p className="text-xs text-zinc-500">auth-flow branch • by subagent-bot</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md">
                  Running
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Platform Plan</h3>
              <p className="text-xs text-zinc-500">Manage subscription features.</p>
            </div>
            
            <div className="p-4 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Current active tier</p>
                <h4 className="text-lg font-black tracking-tight mt-1">Enterprise Developer</h4>
              </div>
              <p className="text-xs text-zinc-300 dark:text-zinc-600">
                Unlock unrestricted multi-tenant client domains, rate throttles limits customization, and magic OTP authentication triggers.
              </p>
              <button className="w-full py-2 bg-white dark:bg-zinc-950 text-black dark:text-white rounded-xl text-xs font-bold hover:shadow-md cursor-pointer transition-shadow">
                Manage Billing
              </button>
            </div>
          </div>

        </div>

      </div>
    </DashboardWrapper>
  );
}
