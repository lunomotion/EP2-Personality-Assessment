'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  total: number;
  byAnimalType: Array<{ animalType: string; count: number }>;
  recent: Array<{
    id: string;
    email: string;
    name: string;
    animalType: string;
    riskLevel: string;
    rewardLevel: string;
    scoringMethod: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/reports/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setError('Failed to load stats'));
  }, []);

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
    );
  }

  if (!stats) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">Total Reports</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        {stats.byAnimalType.map((g) => (
          <div key={g.animalType} className="bg-white rounded-lg border p-5">
            <p className="text-sm text-gray-500">{g.animalType}</p>
            <p className="text-3xl font-bold text-gray-900">{g.count}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { href: '/admin/scoring', label: 'Scoring Rules' },
          { href: '/admin/content', label: 'Content' },
          { href: '/admin/reports', label: 'Reports' },
          { href: '/admin/score-tester', label: 'Score Tester' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-lg border p-4 text-center hover:border-purple-300 hover:shadow-sm transition-all"
          >
            <span className="text-sm font-medium text-purple-600">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent submissions */}
      <div className="bg-white rounded-lg border">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Recent Submissions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No submissions yet
                  </td>
                </tr>
              ) : (
                stats.recent.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{r.email}</td>
                    <td className="px-4 py-3 text-sm">{r.animalType}</td>
                    <td className="px-4 py-3 text-sm">{r.riskLevel}</td>
                    <td className="px-4 py-3 text-sm">{r.rewardLevel}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        r.scoringMethod === 'server'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {r.scoringMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
