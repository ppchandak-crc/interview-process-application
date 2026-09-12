import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';

interface Participant {
  id: number;
  registration_id: string;
  activity_id: number;
  responses: Record<string, any>;
  status: string;
}

const Participants = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/participants/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setParticipants(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getPrimaryValue = (responses: Record<string, any>) => {
    if (!responses) return 'Unknown';
    // Try to find common name fields
    const nameKeys = Object.keys(responses).filter(k => k.toLowerCase().includes('name'));
    if (nameKeys.length > 0) {
      return responses[nameKeys[0]];
    }
    // Fallback to first string value
    const firstString = Object.values(responses).find(v => typeof v === 'string' && v.length > 0);
    return firstString || 'Unknown';
  };

  const getSecondaryValue = (responses: Record<string, any>) => {
    if (!responses) return '';
    // Try to find email or phone
    const contactKeys = Object.keys(responses).filter(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('mobile') || k.toLowerCase().includes('phone'));
    if (contactKeys.length > 0) {
      return responses[contactKeys[0]];
    }
    return '';
  };

  const filtered = participants.filter((p) => {
    const term = search.toLowerCase();
    const primary = getPrimaryValue(p.responses)?.toString().toLowerCase() || '';
    const secondary = getSecondaryValue(p.responses)?.toString().toLowerCase() || '';
    
    return (
      p.registration_id.toLowerCase().includes(term) ||
      primary.includes(term) ||
      secondary.includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Registered': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Verified': return 'bg-green-50 text-green-700 border border-green-200';
      case 'Interview Scheduled': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'Selected': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Participants</h2>
          <p className="text-sm text-slate-500">All registration submissions ({participants.length} total)</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by registration ID or answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full max-w-md"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="px-5 py-3 font-semibold">Reg ID</th>
                <th className="px-5 py-3 font-semibold">Primary Detail</th>
                <th className="px-5 py-3 font-semibold">Secondary Detail</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No participants found.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-medium text-blue-700">{p.registration_id}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {getPrimaryValue(p.responses)}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{getSecondaryValue(p.responses)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/admin/participants/${p.id}`} className="text-slate-500 hover:text-slate-800 inline-flex items-center text-xs font-medium transition-colors">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View / Edit
                      </Link>
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
};

export default Participants;
