import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityApi, dashboardApi, participantApi } from '../../services/api';
import type { Activity } from '../../types/activity';
import {
  Users, AlertTriangle, CheckCircle2, ShieldCheck,
  UserCheck, Phone, ChevronDown, TrendingUp, Building2,
  GraduationCap, BookOpen, Briefcase, ClipboardCheck,
  Download, ExternalLink, FileSpreadsheet
} from 'lucide-react';

const Dashboard = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [interviewStats, setInterviewStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingCsv, setDownloadingCsv] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    activityApi.getAll().then((data) => {
      setActivities(data);
      if (data.length > 0) {
        setSelectedActivityId(data[0].id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedActivityId) {
      setLoading(true);
      Promise.all([
        dashboardApi.getStats(selectedActivityId),
        dashboardApi.getInterviewStats(selectedActivityId),
      ]).then(([s, i]) => {
        setStats(s);
        setInterviewStats(i);
      }).finally(() => setLoading(false));
    }
  }, [selectedActivityId]);

  const drillDown = (params: Record<string, string>) => {
    const qs = new URLSearchParams({ activity_id: String(selectedActivityId), ...params }).toString();
    navigate(`/admin/participants?${qs}`);
  };

  const downloadCSV = async (params: Record<string, string>, label: string) => {
    if (!selectedActivityId) return;
    setDownloadingCsv(label);
    try {
      const data = await participantApi.list({ activity_id: selectedActivityId, ...params });
      if (data.length === 0) {
        alert("No records found for this filter.");
        return;
      }
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
      link.href = url;
      link.download = `${label.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download CSV");
    } finally {
      setDownloadingCsv(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-lg font-medium">No activities found.</p>
        <p className="text-sm mt-1">Create an activity to get started.</p>
      </div>
    );
  }

  const act = stats?.activity;
  const reg = stats?.registration_overview;
  const wa = stats?.whatsapp_control;
  const exc = stats?.exception_report;
  const ivw = interviewStats?.interview_status;
  const sel = interviewStats?.selection;
  const res = interviewStats?.resource_position;
  const alloc = interviewStats?.work_allocation;
  const assess = interviewStats?.overall_assessment;
  const iwWise = interviewStats?.interviewer_wise;

  return (
    <div className="space-y-6">
      {/* Activity Selector Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Participant Management Dashboard</h2>
            <div className="relative inline-block">
              <select
                value={selectedActivityId || ''}
                onChange={(e) => setSelectedActivityId(Number(e.target.value))}
                className="appearance-none bg-slate-50 border border-slate-300 rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[320px]"
              >
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          {act && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
              <span>{act.start_date} — {act.end_date}</span>
              <span>Registration: <strong className={act.status === 'Registration Open' ? 'text-emerald-700' : 'text-red-600'}>{act.status}</strong></span>
              <span>Required: <strong>{act.required_participants}</strong></span>
              <span>Registered: <strong>{reg?.total_registrations}</strong></span>
            </div>
          )}
        </div>
      </div>

      {stats && (
        <>
          {/* Registration Overview */}
          <Section title="Registration Overview" icon={Users}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <StatCard label="Total Registrations" value={reg.total_registrations} filterParams={{}} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Total Registrations"} />
              <StatCard label="Clear Records" value={reg.clear_records} color="emerald" filterParams={{ has_exceptions: 'false' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Clear Records"} />
              <StatCard label="Records with Exceptions" value={reg.records_with_exceptions} color="red" filterParams={{ has_exceptions: 'true' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Records with Exceptions"} />
              <StatCard label="Previous Experience" value={reg.previous_experience} color="indigo" filterParams={{ prev_experience: 'Yes' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Previous Experience"} />
              <StatCard label="Fully Available" value={reg.fully_available} color="emerald" filterParams={{ availability: 'Yes' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Fully Available"} />
              <StatCard label="Parent Permission Yes" value={reg.parent_permission_yes} color="emerald" filterParams={{ parent_permission: 'Yes' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Parent Permission Yes"} />
              <StatCard label="Safety Shoes Yes" value={reg.safety_shoes_yes} color="emerald" filterParams={{ safety_shoes: 'Yes' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Safety Shoes Yes"} />
            </div>
          </Section>

          {/* WhatsApp Contact Control */}
          <Section title="WhatsApp Contact Control" icon={Phone}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Number Entered & Confirmed" value={wa.number_entered} />
              <StatCard label="Proof Uploaded" value={wa.proof_uploaded} />
              <StatCard label="Proof Verified" value={wa.verified} color="emerald" />
              <StatCard label="Verification Pending" value={wa.verification_pending} color="amber" />
              <StatCard label="Number Mismatch" value={wa.mismatch} color="red" />
              <StatCard label="Proof Missing" value={wa.proof_missing} color="red" />
            </div>
          </Section>

          {/* Exception Report */}
          <Section title="Exception Report" icon={AlertTriangle}>
            <div className="flex items-center gap-6 mb-4 text-sm">
              <span className="text-slate-500">Participants with Exceptions: <strong className="text-slate-900">{exc.participants_with_exceptions}</strong></span>
              <span className="text-slate-500">Total Exception Instances: <strong className="text-slate-900">{exc.total_exception_instances}</strong></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(exc.breakdown as Record<string, number>).map(([key, count]) => (
                <div
                  key={key}
                  className="flex flex-col bg-red-50 border border-red-100 rounded-lg overflow-hidden"
                >
                  <div className="px-4 py-3 flex items-center justify-between flex-1">
                    <span className="text-sm font-medium text-red-800">{key}</span>
                    <span className="text-lg font-bold text-red-700">{count}</span>
                  </div>
                  <div className="flex border-t border-red-100/50 bg-red-50/50">
                    <button onClick={() => drillDown({ exception_type: key })} className="flex-1 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100/70 flex items-center justify-center gap-1 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </button>
                    {/* Add CSV export for exceptions? Not possible easily without specific exception filtering logic in the backend */}
                  </div>
                </div>
              ))}
              {Object.keys(exc.breakdown).length === 0 && (
                <p className="text-sm text-slate-400 col-span-full">No exceptions found.</p>
              )}
            </div>
          </Section>

          {/* College-Wise */}
          <Section title="College-Wise Registration" icon={Building2}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="px-4 py-2.5 font-semibold">College</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Registered</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Prev. Experience</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Fully Available</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Exceptions</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(stats.college_wise as Record<string, any>).map(([name, d]: [string, any]) => (
                    <tr key={name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{name}</td>
                      <td className="px-4 py-2.5 text-center">{d.registered}</td>
                      <td className="px-4 py-2.5 text-center">{d.prev_experience}</td>
                      <td className="px-4 py-2.5 text-center">{d.fully_available}</td>
                      <td className="px-4 py-2.5 text-center">{d.exceptions > 0 ? <span className="text-red-600 font-semibold">{d.exceptions}</span> : '0'}</td>
                      <td className="px-4 py-2.5 flex items-center justify-center gap-2">
                        <button onClick={() => drillDown({ college: name })} className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="View">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button onClick={() => downloadCSV({ college: name }, `College_${name}`)} className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Download CSV">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Stream + Year side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Stream-Wise" icon={GraduationCap}>
              <div className="space-y-2">
                {Object.entries(stats.stream_wise as Record<string, number>).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 group">
                    <span className="text-sm font-medium text-slate-700">{name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">{count}</span>
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button onClick={() => drillDown({ stream: name })} className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="View"><ExternalLink className="w-3.5 h-3.5" /></button>
                        <button onClick={() => downloadCSV({ stream: name }, `Stream_${name}`)} className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Download CSV"><Download className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Year-Wise Participants" icon={BookOpen}>
              <div className="space-y-2">
                {Object.entries(stats.year_wise as Record<string, number>).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 group">
                    <span className="text-sm font-medium text-slate-700">{name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">{count}</span>
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button onClick={() => drillDown({ year: name })} className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="View"><ExternalLink className="w-3.5 h-3.5" /></button>
                        <button onClick={() => downloadCSV({ year: name }, `Year_${name}`)} className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Download CSV"><Download className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Experience */}
          <Section title="Experience" icon={Briefcase}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-bold text-slate-400 uppercase mb-3">Previous Stock Audit / PIV with CRC</p>
                <div className="flex gap-4">
                  <div className="flex-1 text-center group cursor-pointer hover:bg-indigo-50 rounded-lg p-2 transition-colors relative" onClick={() => drillDown({ prev_experience: 'Yes' })}>
                    <p className="text-2xl font-bold text-emerald-700">{stats.experience.crc.yes}</p>
                    <p className="text-xs text-slate-500">Yes</p>
                  </div>
                  <div className="flex-1 text-center group cursor-pointer hover:bg-indigo-50 rounded-lg p-2 transition-colors relative" onClick={() => drillDown({ prev_experience: 'No' })}>
                    <p className="text-2xl font-bold text-slate-600">{stats.experience.crc.no}</p>
                    <p className="text-xs text-slate-500">No</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-bold text-slate-400 uppercase mb-3">Other Industrial Experience</p>
                <div className="flex gap-4">
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-bold text-emerald-700">{stats.experience.other.yes}</p>
                    <p className="text-xs text-slate-500">Yes</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-bold text-slate-600">{stats.experience.other.no}</p>
                    <p className="text-xs text-slate-500">No</p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Readiness */}
          <Section title="Readiness Parameters" icon={ShieldCheck}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="px-4 py-2.5 font-semibold">Parameter</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Yes</th>
                    <th className="px-4 py-2.5 font-semibold text-center">No</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(stats.readiness as Record<string, { yes: number; no: number }>).map(([key, val]) => (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-700 capitalize">{key.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-2.5 text-center text-emerald-700 font-semibold">{val.yes}</td>
                      <td className="px-4 py-2.5 text-center text-red-600 font-semibold">{val.no}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}

      {interviewStats && (
        <>
          {/* Interview Status */}
          <Section title="Interview Status" icon={ClipboardCheck}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <StatCard label="Interview Pending" value={ivw.interview_pending} color="amber" filterParams={{ final_status: 'Registered' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Interview Pending"} />
              <StatCard label="Interview Completed" value={ivw.interview_completed} color="emerald" filterParams={{ final_status: 'Interview Completed' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Interview Completed"} />
              <StatCard label="Total Registrations" value={ivw.total_registrations} filterParams={{}} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Total Registrations"} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Recommended</p>
                <p className="text-2xl font-bold text-emerald-700">{ivw.recommended}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Hold / Waitlist</p>
                <p className="text-2xl font-bold text-amber-700">{ivw.hold_waitlist}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Not Recommended</p>
                <p className="text-2xl font-bold text-red-700">{ivw.not_recommended}</p>
              </div>
            </div>
          </Section>

          {/* Work Allocation + Assessment side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Recommended Work Allocation" icon={Briefcase}>
              <div className="space-y-2">
                {Object.entries(alloc as Record<string, number>).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                    <span className="text-sm font-medium text-slate-700">{name}</span>
                    <span className="text-sm font-bold text-slate-900">{count}</span>
                  </div>
                ))}
                {Object.keys(alloc).length === 0 && <p className="text-sm text-slate-400">No interviews completed yet.</p>}
              </div>
            </Section>
            <Section title="Overall Assessment" icon={TrendingUp}>
              <div className="space-y-2">
                {['Best', 'Good', 'OK', 'Not Good'].map((key) => (
                  <div key={key} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                    <span className="text-sm font-medium text-slate-700">{key}</span>
                    <span className="text-sm font-bold text-slate-900">{(assess as Record<string, number>)?.[key] || 0}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Interviewer-Wise */}
          {iwWise && Object.keys(iwWise).length > 0 && (
            <Section title="Interviewer-Wise Progress" icon={UserCheck}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="px-3 py-2.5 font-semibold">Interviewer</th>
                      <th className="px-3 py-2.5 font-semibold text-center">Completed</th>
                      <th className="px-3 py-2.5 font-semibold text-center">Best</th>
                      <th className="px-3 py-2.5 font-semibold text-center">Good</th>
                      <th className="px-3 py-2.5 font-semibold text-center">OK</th>
                      <th className="px-3 py-2.5 font-semibold text-center">Not Good</th>
                      <th className="px-3 py-2.5 font-semibold text-center">Recommended</th>
                      <th className="px-3 py-2.5 font-semibold text-center">Hold</th>
                      <th className="px-3 py-2.5 font-semibold text-center">Not Rec.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(iwWise).map(([name, d]: [string, any]) => (
                      <tr key={name} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-medium text-slate-800">{name}</td>
                        <td className="px-3 py-2.5 text-center font-semibold">{d.completed}</td>
                        <td className="px-3 py-2.5 text-center">{d.Best}</td>
                        <td className="px-3 py-2.5 text-center">{d.Good}</td>
                        <td className="px-3 py-2.5 text-center">{d.OK}</td>
                        <td className="px-3 py-2.5 text-center">{d['Not Good']}</td>
                        <td className="px-3 py-2.5 text-center text-emerald-700">{d.Recommended}</td>
                        <td className="px-3 py-2.5 text-center text-amber-600">{d['Hold/Waitlist']}</td>
                        <td className="px-3 py-2.5 text-center text-red-600">{d['Not Recommended']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Final Selection + Resource Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Final Selection" icon={CheckCircle2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StatCard label="Selected" value={sel.selected} color="emerald" filterParams={{ final_status: 'Selected' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Selected"} />
                <StatCard label="Waitlisted" value={sel.waitlisted} color="amber" filterParams={{ final_status: 'Waitlisted' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Waitlisted"} />
                <StatCard label="Not Selected" value={sel.not_selected} color="red" filterParams={{ final_status: 'Not Selected' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Not Selected"} />
                <StatCard label="Confirmed" value={sel.confirmed} color="indigo" filterParams={{ final_status: 'Confirmed' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Confirmed"} />
                <StatCard label="Cancelled" value={sel.cancelled} color="slate" filterParams={{ final_status: 'Cancelled' }} onView={drillDown} onDownload={downloadCSV} isDownloading={downloadingCsv === "Cancelled"} />
                <StatCard label="Decision Pending" value={sel.decision_pending} color="amber" />
              </div>
            </Section>
            <Section title="Resource Position" icon={TrendingUp}>
              <div className="space-y-4 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Required Participants</span>
                  <span className="text-xl font-bold text-slate-900">{res.required}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Selected</span>
                  <span className="text-xl font-bold text-emerald-700">{res.selected}</span>
                </div>
                {res.shortfall > 0 && (
                  <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    <span className="text-sm font-medium text-red-700">Shortfall</span>
                    <span className="text-xl font-bold text-red-700">{res.shortfall}</span>
                  </div>
                )}
                {res.buffer > 0 && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
                    <span className="text-sm font-medium text-emerald-700">Buffer</span>
                    <span className="text-xl font-bold text-emerald-700">{res.buffer}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Waitlisted</span>
                  <span className="text-lg font-bold text-amber-600">{res.waitlisted}</span>
                </div>
              </div>
            </Section>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Reusable Components ─────────────────────────────────

const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
      <Icon className="w-4 h-4 text-slate-400" />
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  default: { bg: 'bg-slate-50', text: 'text-slate-900', border: 'border-slate-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

const StatCard = ({
  label,
  value,
  color = 'default',
  filterParams,
  onView,
  onDownload,
  isDownloading
}: {
  label: string;
  value: number;
  color?: string;
  filterParams?: Record<string, string>;
  onView?: (params: Record<string, string>) => void;
  onDownload?: (params: Record<string, string>, label: string) => void;
  isDownloading?: boolean;
}) => {
  const c = colorMap[color] || colorMap.default;
  const hasActions = onView || onDownload;

  return (
    <div className={`${c.bg} border ${c.border} rounded-lg flex flex-col overflow-hidden transition-shadow hover:shadow-md h-full`}>
      <div className="p-4 flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
      </div>
      {hasActions && filterParams && (
        <div className="flex border-t border-slate-200/60 bg-white/40">
          {onView && (
            <button
              onClick={() => onView(filterParams)}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-white/80 hover:text-indigo-600 flex items-center justify-center gap-1.5 transition-colors border-r border-slate-200/60"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View
            </button>
          )}
          {onDownload && (
            <button
              onClick={() => onDownload(filterParams, label)}
              disabled={isDownloading}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-white/80 hover:text-emerald-600 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              {isDownloading ? '...' : 'CSV'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
