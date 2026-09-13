import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { participantApi, interviewApi } from '../../services/api';
import {
  ArrowLeft, AlertTriangle, CheckCircle2, Phone, User,
  GraduationCap, Briefcase, Users, Shield, Save, Lock
} from 'lucide-react';

const ParticipantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [interviewExists, setInterviewExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const role = localStorage.getItem('role') || '';

  // Interview form state
  const [workAllocation, setWorkAllocation] = useState('');
  const [workAllocationOther, setWorkAllocationOther] = useState('');
  const [assessment, setAssessment] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [remarks, setRemarks] = useState('');

  // Final status
  const [finalStatus, setFinalStatus] = useState('');

  useEffect(() => {
    if (id) loadData(parseInt(id));
  }, [id]);

  const loadData = async (pid: number) => {
    setLoading(true);
    try {
      const p = await participantApi.getById(pid);
      setParticipant(p);
      setFinalStatus(p.final_status || 'Registered');

      try {
        const iv = await interviewApi.get(pid);
        setInterview(iv);
        setInterviewExists(true);
        setWorkAllocation(iv.work_allocation || '');
        setWorkAllocationOther(iv.work_allocation_other || '');
        setAssessment(iv.overall_assessment || '');
        setRecommendation(iv.recommendation || '');
        setRemarks(iv.remarks || '');
      } catch {
        setInterviewExists(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveInterview = async () => {
    if (!id) return;
    setSaving(true);
    setMessage('');
    try {
      const data = {
        work_allocation: workAllocation,
        work_allocation_other: workAllocation === 'Other' ? workAllocationOther : '',
        overall_assessment: assessment,
        recommendation,
        remarks,
      };

      if (interviewExists) {
        await interviewApi.update(parseInt(id), data);
      } else {
        await interviewApi.create({ participant_id: parseInt(id), ...data });
        setInterviewExists(true);
      }
      setMessage('Interview saved successfully.');
      loadData(parseInt(id));
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to save interview.');
    } finally {
      setSaving(false);
    }
  };

  const saveFinalStatus = async () => {
    if (!id) return;
    try {
      await participantApi.updateFinalStatus(parseInt(id), finalStatus);
      setMessage('Status updated.');
      loadData(parseInt(id));
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to update status.');
    }
  };

  const verifyWhatsApp = async (verified: boolean) => {
    if (!id) return;
    try {
      await participantApi.verifyWhatsApp(parseInt(id), { verified, note: verified ? 'matched' : 'mismatch' });
      loadData(parseInt(id));
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to verify.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!participant) {
    return <div className="text-center py-20 text-slate-500">Participant not found.</div>;
  }

  const r = participant.responses || {};
  const exceptions: string[] = participant.exceptions || [];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button + Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Participant: {participant.registration_id}</h2>
          <p className="text-sm text-slate-500">{participant.name || 'Unnamed'}</p>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2.5 rounded-lg text-sm font-medium">
          {message}
        </div>
      )}

      {/* Exceptions Banner */}
      {exceptions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-bold text-red-800">Exceptions ({exceptions.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {exceptions.map((e: string) => (
              <span key={e} className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded">{e}</span>
            ))}
          </div>
        </div>
      )}

      {/* Registration Profile */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Registration Information</h3>
        </div>
        <div className="p-5 space-y-6">

          {/* WhatsApp */}
          <ProfileSection title="WhatsApp Contact" icon={Phone}>
            <ProfileRow label="WhatsApp Number" value={r.whatsapp_number} />
            <ProfileRow label="Confirmed Number" value={r.whatsapp_confirm} />
            <div className="flex items-center gap-3">
              <ProfileRow label="Proof" value={r.whatsapp_proof ? 'Uploaded' : 'Not uploaded'} />
              {r.whatsapp_proof && (
                <a href={`http://localhost:8000/uploads/${r.whatsapp_proof}`} target="_blank" className="text-xs text-indigo-600 hover:underline">View</a>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-500">Verification:</span>
              {participant.whatsapp_verified ? (
                <span className="text-xs font-medium text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => verifyWhatsApp(true)} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium hover:bg-emerald-200 transition-colors">Mark Verified</button>
                  <button onClick={() => verifyWhatsApp(false)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium hover:bg-red-200 transition-colors">Mark Mismatch</button>
                </div>
              )}
            </div>
          </ProfileSection>

          {/* Personal */}
          <ProfileSection title="Personal Information" icon={User}>
            <div className="grid grid-cols-3 gap-4">
              <ProfileRow label="Surname" value={r.surname} />
              <ProfileRow label="First Name" value={r.first_name} />
              <ProfileRow label="Middle Name" value={r.middle_name} />
            </div>
            <ProfileRow label="Address" value={r.address} />
            <div className="grid grid-cols-3 gap-4">
              <ProfileRow label="City" value={r.city} />
              <ProfileRow label="District" value={r.district} />
              <ProfileRow label="PIN Code" value={r.pincode} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ProfileRow label="Date of Birth" value={r.dob} />
              <ProfileRow label="Age" value={participant.age} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ProfileRow label="ID Proof Type" value={r.id_type} />
              <div className="flex items-center gap-2">
                <ProfileRow label="ID Proof" value={r.id_proof ? 'Uploaded' : 'Not uploaded'} />
                {r.id_proof && <a href={`http://localhost:8000/uploads/${r.id_proof}`} target="_blank" className="text-xs text-indigo-600 hover:underline">View</a>}
              </div>
            </div>
            {r.photo && (
              <div>
                <span className="text-xs text-slate-500">Photo:</span>
                <a href={`http://localhost:8000/uploads/${r.photo}`} target="_blank" className="text-xs text-indigo-600 hover:underline ml-2">View Photo</a>
              </div>
            )}
          </ProfileSection>

          {/* College */}
          <ProfileSection title="College Information" icon={GraduationCap}>
            <div className="grid grid-cols-2 gap-4">
              <ProfileRow label="College" value={r.college_name} />
              <ProfileRow label="Roll No" value={r.roll_no} />
              <ProfileRow label="Stream" value={r.stream} />
              <ProfileRow label="Year" value={r.year} />
            </div>
          </ProfileSection>

          {/* Experience */}
          <ProfileSection title="Experience" icon={Briefcase}>
            <ProfileRow label="Previous Experience with CRC" value={r.exp_crc} />
            <ProfileRow label="Other Industrial Experience" value={r.exp_other} />
          </ProfileSection>

          {/* Parent + Friend */}
          <ProfileSection title="Parent & Friend" icon={Users}>
            <div className="grid grid-cols-2 gap-4">
              <ProfileRow label="Parent Permission" value={r.parent_perm} />
              <ProfileRow label="Parent Mobile" value={r.parent_mobile} />
              <ProfileRow label="Friend Name" value={r.friend_name} />
              <ProfileRow label="Friend Mobile" value={r.friend_mobile} />
            </div>
          </ProfileSection>

          {/* Safety + Availability */}
          <ProfileSection title="Safety & Availability" icon={Shield}>
            <ProfileRow label="Safety Shoes" value={r.safety_shoes} />
            <ProfileRow label="Availability" value={r.availability} />
          </ProfileSection>
        </div>
      </div>

      {/* Interview Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-900">Interview</h3>
          {interviewExists && interview?.interviewer_name && (
            <span className="text-xs text-slate-500 ml-auto">Interviewed by: {interview.interviewer_name} on {interview.created_at ? new Date(interview.created_at).toLocaleString() : '—'}</span>
          )}
        </div>
        <div className="p-5 space-y-4">
          {/* Quick participant summary for interviewer */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-slate-500 block text-xs">College</span><strong>{r.college_name || '—'}</strong></div>
            <div><span className="text-slate-500 block text-xs">Age</span><strong>{participant.age || '—'}</strong></div>
            <div><span className="text-slate-500 block text-xs">Prev. Exp CRC</span><strong>{r.exp_crc || '—'}</strong></div>
            <div><span className="text-slate-500 block text-xs">Parent Permission</span><strong>{r.parent_perm || '—'}</strong></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Recommended Work Allocation</label>
              <select value={workAllocation} onChange={(e) => setWorkAllocation(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="">Select</option>
                <option value="Counting">Counting</option>
                <option value="TL">TL</option>
                <option value="Counting / TL">Counting / TL</option>
                <option value="Other">Other</option>
              </select>
              {workAllocation === 'Other' && (
                <input type="text" value={workAllocationOther} onChange={(e) => setWorkAllocationOther(e.target.value)} placeholder="Specify other" className="w-full mt-2 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Overall Assessment</label>
              <select value={assessment} onChange={(e) => setAssessment(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="">Select</option>
                <option value="Best">Best</option>
                <option value="Good">Good</option>
                <option value="OK">OK</option>
                <option value="Not Good">Not Good</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Recommendation</label>
            <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none md:max-w-xs">
              <option value="">Select</option>
              <option value="Recommended">Recommended</option>
              <option value="Hold/Waitlist">Hold / Waitlist</option>
              <option value="Not Recommended">Not Recommended</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Interview Remarks / Observations</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Communication, confidence, maturity, practical understanding, punctuality, availability concerns..." />
          </div>

          <button onClick={saveInterview} disabled={saving} className="bg-[#1a2332] hover:bg-[#263347] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : interviewExists ? 'Update Interview' : 'Save Interview'}
          </button>
        </div>
      </div>

      {/* Final Status (Admin/Super Admin only) */}
      {(role === 'super_admin' || role === 'admin') && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Final Selection Status</h3>
            <span className="text-xs text-slate-400 ml-auto">Admin / Super Admin only</span>
          </div>
          <div className="p-5 flex items-end gap-4">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <select value={finalStatus} onChange={(e) => setFinalStatus(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="Registered">Registered</option>
                <option value="Interview Pending">Interview Pending</option>
                <option value="Interview Completed">Interview Completed</option>
                <option value="Selected">Selected</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Not Selected">Not Selected</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <button onClick={saveFinalStatus} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors">
              Update Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────

const ProfileSection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-slate-400" />
      <h4 className="text-sm font-bold text-slate-700">{title}</h4>
    </div>
    <div className="space-y-2 pl-6">{children}</div>
  </div>
);

const ProfileRow = ({ label, value }: { label: string; value: any }) => (
  <div className="text-sm">
    <span className="text-slate-500">{label}: </span>
    <span className="font-medium text-slate-800">{value || '—'}</span>
  </div>
);

export default ParticipantDetail;
