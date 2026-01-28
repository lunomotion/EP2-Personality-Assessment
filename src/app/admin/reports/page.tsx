'use client';

import { useEffect, useState, useCallback } from 'react';

interface ReportRow {
  id: string;
  email: string;
  name: string;
  animalType: string;
  riskLevel: string;
  rewardLevel: string;
  driverKey: string;
  strategyKey: string;
  scoringMethod: string;
  createdAt: string;
}

interface ReportsResponse {
  reports: ReportRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState('');
  const [animalFilter, setAnimalFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const loadReports = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', '20');
    if (emailFilter) params.set('email', emailFilter);
    if (animalFilter) params.set('animalType', animalFilter);
    if (methodFilter) params.set('scoringMethod', methodFilter);

    fetch(`/api/admin/reports?${params}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError('Failed to load reports'));
  }, [page, emailFilter, animalFilter, methodFilter]);

  useEffect(() => { loadReports(); }, [loadReports]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1);
    loadReports();
  }

  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-lg border p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-medium text-gray-500">Email</label>
            <input
              type="text"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="Search by email..."
              className="block mt-1 px-3 py-1.5 border rounded text-sm w-64"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Animal Type</label>
            <select value={animalFilter} onChange={(e) => { setAnimalFilter(e.target.value); setPage(1); }}
              className="block mt-1 px-3 py-1.5 border rounded text-sm">
              <option value="">All</option>
              <option value="African Dog">African Dog</option>
              <option value="Lion">Lion</option>
              <option value="Killer Whale">Killer Whale</option>
              <option value="Tiger">Tiger</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Scoring Method</label>
            <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
              className="block mt-1 px-3 py-1.5 border rounded text-sm">
              <option value="">All</option>
              <option value="typeform">Typeform</option>
              <option value="server">Server</option>
            </select>
          </div>
          <button type="submit"
            className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
            Search
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strategy</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!data ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : data.reports.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No reports found</td>
              </tr>
            ) : (
              data.reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => window.open(`/report?email=${encodeURIComponent(r.email)}`, '_blank')}>
                  <td className="px-4 py-3 text-sm">{r.email}</td>
                  <td className="px-4 py-3 text-sm">{r.animalType}</td>
                  <td className="px-4 py-3 text-sm">{r.riskLevel}</td>
                  <td className="px-4 py-3 text-sm">{r.rewardLevel}</td>
                  <td className="px-4 py-3 text-sm">{r.driverKey}</td>
                  <td className="px-4 py-3 text-sm">{r.strategyKey}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      r.scoringMethod === 'server' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
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

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            Page {data.page} of {data.totalPages} ({data.total} total)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
