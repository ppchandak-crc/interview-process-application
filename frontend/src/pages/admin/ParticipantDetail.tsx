import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormSchema } from '../../components/FormBuilder';
import { activityApi } from '../../services/api';

interface ParticipantData {
  id: number;
  registration_id: string;
  activity_id: number;
  responses: Record<string, any>;
  status: string;
}

const statusOptions = ['Registered', 'Verified', 'Interview Scheduled', 'Selected', 'Rejected'];

const ParticipantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editResponses, setEditResponses] = useState<Record<string, any>>({});
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  const isSuperAdmin = localStorage.getItem('role') === 'SUPER_ADMIN';

  useEffect(() => {
    fetchParticipant();
  }, [id]);

  const fetchParticipant = async () => {
    try {
      const res = await fetch(`http://localhost:8000/participants/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setParticipant(data);
      setEditResponses(data.responses || {});
      setStatus(data.status);
      
      // Load activity to get schema
      const act = await activityApi.getById(data.activity_id);
      setSchema(act.form_schema as FormSchema);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldId: string, value: string) => {
    setEditResponses((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(`http://localhost:8000/participants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ responses: editResponses, status }),
      });
      if (response.ok) {
        const updated = await response.json();
        setParticipant(updated);
        setMessage('Saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save.');
      }
    } catch {
      setMessage('Error saving changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">Loading...</div>;
  }

  if (!participant || !schema) {
    return <div className="flex items-center justify-center py-20 text-slate-400">Participant or form schema not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin/participants" className="text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registration Details</h2>
            <p className="text-sm font-mono text-blue-700">{participant.registration_id}</p>
          </div>
        </div>
        {isSuperAdmin && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1a2332] hover:bg-[#263347] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-md text-sm font-medium ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Status */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Application Status</h3>
        <div className="max-w-xs">
          <select
            disabled={!isSuperAdmin}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isSuperAdmin ? 'bg-slate-50 text-slate-500 appearance-none' : 'bg-white'}`}
          >
            {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Dynamic Sections */}
      {schema.sections?.map((section, sIdx) => (
        <div key={section.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">{sIdx + 1}. {section.title}</h3>
          
          <div className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.id} className="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                <label className="block text-xs font-semibold text-slate-500 mb-1">{field.label}</label>
                
                {field.type === 'file' ? (
                  editResponses[field.id] ? (
                    <div>
                      <a href={`http://localhost:8000/uploads/${editResponses[field.id]}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium">
                        View Uploaded File
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No file uploaded</p>
                  )
                ) : field.type === 'select' ? (
                  <select
                    disabled={!isSuperAdmin}
                    value={editResponses[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`w-full md:w-1/2 px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isSuperAdmin ? 'bg-slate-50 text-slate-500 appearance-none border-transparent px-0' : 'bg-white'}`}
                  >
                    <option value="">--</option>
                    {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    disabled={!isSuperAdmin}
                    value={editResponses[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isSuperAdmin ? 'bg-slate-50 text-slate-800 border-transparent px-0 resize-none h-auto' : 'bg-white'}`}
                  />
                ) : (
                  <input
                    type={field.type}
                    disabled={!isSuperAdmin}
                    value={editResponses[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`w-full md:w-1/2 px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isSuperAdmin ? 'bg-transparent text-slate-800 border-transparent px-0 font-medium' : 'bg-white'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParticipantDetail;
