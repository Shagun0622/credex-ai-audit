'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown,
  Mail,
  Users,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Activity,
  MousePointer,
  RefreshCw,
} from 'lucide-react';

interface DashboardStats {
  totalAudits: number;
  totalLeads: number;
  uniqueUsers: number;
  totalSavings: number;
  emailsSent: number;
  clickThroughs: number;
  recentAudits: any[];
  recentChanges: any[];
  weeklyActivity: { date: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchStats(isRefresh = false) {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? ''}`,
        },
        // Bypass Next.js cache so refresh always gets fresh data
        cache: 'no-store',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data: DashboardStats = await res.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Initial load
  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchStats(true), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1A3A6B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B6A66]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchStats()}
            className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg text-sm hover:bg-[#2A4A7B]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Audits',
      value: stats?.totalAudits ?? 0,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-blue-500',
      change: 'All time',
    },
    {
      title: 'Total Leads',
      value: stats?.totalLeads ?? 0,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      change: 'Subscribed users',
    },
    {
      title: 'Unique Users',
      value: stats?.uniqueUsers ?? 0,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
      change: 'Distinct emails',
    },
    {
      title: 'Total Savings Found',
      value: `$${(stats?.totalSavings ?? 0).toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-amber-500',
      change: 'Across all audits',
    },
    {
      title: 'Emails Sent',
      value: stats?.emailsSent ?? 0,
      icon: <Mail className="w-6 h-6" />,
      color: 'bg-indigo-500',
      change: 'Pricing notifications',
    },
    {
      title: 'Est. Click-Through',
      value: `${Math.round(((stats?.clickThroughs ?? 0) / Math.max(stats?.emailsSent ?? 1, 1)) * 100)}%`,
      icon: <MousePointer className="w-6 h-6" />,
      color: 'bg-cyan-500',
      change: `${stats?.clickThroughs ?? 0} estimated clicks`,
    },
  ];

  const maxActivity = Math.max(...(stats?.weeklyActivity.map((d) => d.count) ?? [1]), 1);

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      {/* Header */}
      <div className="border-b border-[#E2E0DB] bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-[#1A3A6B]" />
            <span className="text-base font-semibold tracking-tight text-[#0F0E0D]">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#6B6A66]">
            {lastUpdated && (
              <span className="text-xs text-[#8C8A86]">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1A3A6B] text-white rounded-lg text-xs hover:bg-[#2A4A7B] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              Live
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F0E0D] mb-2">Analytics Overview</h1>
          <p className="text-[#6B6A66]">Monitor your AI Spend Audit performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-[#E2E0DB] rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#8C8A86] mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-[#0F0E0D]">{card.value}</p>
                  <p className="text-xs text-[#8C8A86] mt-2">{card.change}</p>
                </div>
                <div className={`${card.color} p-3 rounded-xl text-white`}>{card.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-[#E2E0DB] rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-[#0F0E0D] mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1A3A6B]" />
              Weekly Activity
            </h3>
            <div className="flex items-end justify-between gap-2 h-48">
              {stats?.weeklyActivity.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-[#1A3A6B] rounded-lg transition-all hover:bg-[#2A4A7B]"
                    style={{ height: `${Math.max(4, (day.count / maxActivity) * 160)}px` }}
                  />
                  <p className="text-xs text-[#8C8A86] text-center leading-tight">{day.date}</p>
                  <p className="text-sm font-semibold text-[#0F0E0D]">{day.count}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Pricing Changes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white border border-[#E2E0DB] rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-[#0F0E0D] mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Recent Pricing Changes
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {(stats?.recentChanges.length ?? 0) === 0 ? (
                <p className="text-sm text-[#8C8A86] text-center py-8">No pricing changes detected yet</p>
              ) : (
                stats?.recentChanges.map((change, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#0F0E0D]">{change.tool}</p>
                      <p className="text-xs text-[#8C8A86]">{change.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        <span className="text-red-500 line-through">${change.old_price}</span>
                        <span className="text-green-600 ml-2 font-semibold">${change.new_price}</span>
                      </p>
                      <p className="text-xs text-[#8C8A86]">
                        {new Date(change.detected_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Audits Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-[#E2E0DB] rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#0F0E0D] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1A3A6B]" />
            Recent Audits
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E0DB]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#8C8A86]">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#8C8A86]">Tools</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#8C8A86]">Savings</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#8C8A86]">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#8C8A86]">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentAudits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-[#8C8A86]">
                      No audits yet
                    </td>
                  </tr>
                ) : (
                  stats?.recentAudits.map((audit, i) => (
                    <tr key={i} className="border-b border-[#E2E0DB] hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-[#0F0E0D]">{audit.email}</td>
                      <td className="py-3 px-4 text-sm text-[#6B6A66]">
                        {audit.input_stack?.tools?.length ?? 0}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600">
                        ${audit.output_result?.totalSavings ?? 0}/mo
                      </td>
                      <td className="py-3 px-4 text-sm text-[#8C8A86]">
                        {new Date(audit.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {audit.last_notified_at ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" /> Notified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-[#8C8A86]">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="mt-8 text-center text-sm text-[#8C8A86]">
          <p>AI Spend Audit Admin Dashboard — Auto-refreshes every 30s</p>
        </div>
      </div>
    </div>
  );
}