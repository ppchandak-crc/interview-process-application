import { useState, useEffect } from 'react';
import { activityApi, participantApi } from '../../services/api';
import type { Activity } from '../../types/activity';
import { Download, FileText, ChevronDown } from 'lucide-react';

const reportTypes = [
  { key: 'all', label: 'All Registrations', params: {} },
  { key: 'exceptions', label: 'Exception Report', params: { has_exceptions: 'true' } },
  { key: 'clear', label: 'Clear Records', params: { has_exceptions: 'false' } },
  { key: 'prev_exp', label: 'Previous Experience (CRC)', params: { prev_experience: 'Yes' } },
  { key: 'interview_pending', label: 'Interview Pending', params: { final_status: 'Registered' } },
  { key: 'interview_done', label: 'Interview Completed', params: { final_status: 'Interview Completed' } },
  { key: 'selected', label: 'Selected Participants', params: { final_status: 'Selected' } },
  { key: 'waitlisted', label: 'Waitlisted Participants', params: { final_status: 'Waitlisted' } },
  { key: 'not_selected', label: 'Not Selected', params: { final_status: 'Not Selected' } },
  { key: 'confirmed', label: 'Confirmed Participants', params: { final_status: 'Confirmed' } },
  { key: 'cancelled', label: 'Cancelled', params: { final_status: 'Cancelled' } },
  { key: 'parent_no', label: 'Parent Permission - No', params: { parent_permission: 'No' } },
  { key: 'shoes_no', label: 'Safety Shoes - No', params: { safety_shoes: 'No' } },
  { key: 'unavailable', label: 'Not Fully Available', params: { availability: 'No' } },
];

const Reports = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState('all');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    activityApi.getAll().then((a) => {
      setActivities(a);
      if (a.length > 0) setSelectedActivityId(String(a[0].id));
    });
  }, []);

  const generateReport = async () => {
    setLoading(true);
    setGenerated(false);
    try {
      const report = reportTypes.find((r) => r.key === selectedReport);
      const params: Record<string, any> = { ...report?.params };
      if (selectedActivityId) params.activity_id = selectedActivityId;
      const result = await participantApi.list(params);
      setData(result);
      setGenerated(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = ['Reg ID', 'Name', 'Age', 'College', 'Stream', 'Year', 'WhatsApp', 'Parent Permission', 'Safety Shoes', 'Availability', 'Prev Exp CRC', 'Exceptions', 'Status'];
    const rows = data.map((p: any) => [
      p.registration_id,
      p.name || '',
      p.age || '',
      p.college || '',
      p.stream || '',
      p.education_year || '',
      p.whatsapp_number || '',
      p.parent_permission || '',
      p.safety_shoes || '',
      p.availability || '',
      p.prev_experience_crc || '',
      (p.exceptions || []).join('; '),
      p.final_status || p.status || '',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const reportLabel = reportTypes.find((r) => r.key === selectedReport)?.label || 'report';
    link.href = url;
    link.download = `${reportLabel.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Reports & Export</h2>
        <p className="text-sm text-slate-500">Generate and export filtered reports</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Activity</label>
            <div className="relative">
              <select value={selectedActivityId} onChange={(e) => setSelectedActivityId(e.target.value)} className="w-full appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="">All Activities</option>
                {activities.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Report Type</label>
            <div className="relative">
              <select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)} className="w-full appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                {reportTypes.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={generateReport} disabled={loading} className="bg-[#1a2332] hover:bg-[#263347] text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
              <FileText className="w-4 h-4" />
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            {generated && data.length > 0 && (
              <button onClick={exportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {generated && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {reportTypes.find((r) => r.key === selectedReport)?.label} — {data.length} records
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="px-3 py-2.5 font-semibold">Reg ID</th>
                  <th className="px-3 py-2.5 font-semibold">Name</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Age</th>
                  <th className="px-3 py-2.5 font-semibold">College</th>
                  <th className="px-3 py-2.5 font-semibold">Stream</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Year</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Exceptions</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.length === 0 ? (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-400">No records match this criteria.</td></tr>
                ) : (
                  data.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-mono text-xs text-indigo-600 font-medium">{p.registration_id}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-800">{p.name || '—'}</td>
                      <td className="px-3 py-2.5 text-center text-slate-600">{p.age || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-600">{p.college || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-600">{p.stream || '—'}</td>
                      <td className="px-3 py-2.5 text-center text-slate-600">{p.education_year || '—'}</td>
                      <td className="px-3 py-2.5 text-center">
                        {p.exceptions && p.exceptions.length > 0 ? (
                          <span className="bg-red-100 text-red-700 text-xs font-bold rounded-full px-2 py-0.5">{p.exceptions.length}</span>
                        ) : (
                          <span className="text-emerald-500 text-xs">Clear</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium text-slate-600">{p.final_status || p.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
