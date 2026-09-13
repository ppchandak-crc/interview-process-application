import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { participantApi, activityApi, mastersApi } from '../../services/api';
import type { Activity } from '../../types/activity';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

const Participants = () => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [masterColleges, setMasterColleges] = useState<string[]>([]);
  const [masterStreams, setMasterStreams] = useState<string[]>([]);
  const [masterYears, setMasterYears] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter state from URL params
  const activityId = searchParams.get('activity_id') || '';
  const search = searchParams.get('search') || '';
  const college = searchParams.get('college') || '';
  const stream = searchParams.get('stream') || '';
  const year = searchParams.get('year') || '';
  const prevExp = searchParams.get('prev_experience') || '';
  const parentPerm = searchParams.get('parent_permission') || '';
  const shoes = searchParams.get('safety_shoes') || '';
  const availability = searchParams.get('availability') || '';
  const hasExceptions = searchParams.get('has_exceptions') || '';
  const exceptionType = searchParams.get('exception_type') || '';
  const finalStatus = searchParams.get('final_status') || '';

  useEffect(() => {
    activityApi.getAll().then(setActivities);
    // Load master data for filter dropdowns
    mastersApi.getColleges().then((data: any[]) => setMasterColleges(data.filter(c => c.is_active).map(c => c.name)));
    mastersApi.getStreams().then((data: any[]) => setMasterStreams(data.filter(s => s.is_active).map(s => s.name)));
    mastersApi.getYears().then((data: any[]) => setMasterYears(data.filter(y => y.is_active).map(y => y.name)));
  }, []);

  useEffect(() => {
    loadParticipants();
  }, [searchParams]);

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (activityId) params.activity_id = activityId;
      if (search) params.search = search;
      if (college) params.college = college;
      if (stream) params.stream = stream;
      if (year) params.year = year;
      if (prevExp) params.prev_experience = prevExp;
      if (parentPerm) params.parent_permission = parentPerm;
      if (shoes) params.safety_shoes = shoes;
      if (availability) params.availability = availability;
      if (hasExceptions) params.has_exceptions = hasExceptions;
      if (exceptionType) params.exception_type = exceptionType;
      if (finalStatus) params.final_status = finalStatus;
      const data = await participantApi.list(params);
      setParticipants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFilterCount = Array.from(searchParams.entries()).filter(([k]) => k !== 'search' && k !== 'activity_id').length;

  const badge = (val: string | undefined, positive: string) => {
    if (!val) return <span className="text-slate-300">—</span>;
    const isPositive = val.toLowerCase() === positive.toLowerCase() || val.toLowerCase() === 'already have';
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
        {val}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Registered': 'bg-slate-100 text-slate-700',
      'Interview Pending': 'bg-amber-50 text-amber-700',
      'Interview Completed': 'bg-blue-50 text-blue-700',
      'Selected': 'bg-emerald-50 text-emerald-700',
      'Waitlisted': 'bg-amber-50 text-amber-700',
      'Not Selected': 'bg-red-50 text-red-700',
      'Confirmed': 'bg-indigo-50 text-indigo-700',
      'Cancelled': 'bg-slate-100 text-slate-500',
    };
    return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Participants</h2>
          <p className="text-sm text-slate-500">{participants.length} records found</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Activity Filter */}
          <div className="relative">
            <select
              value={activityId}
              onChange={(e) => updateFilter('activity_id', e.target.value)}
              className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Activities</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-3 flex items-center gap-3 border-b border-slate-200">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, Reg ID, WhatsApp, college, friend..."
              defaultValue={search}
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateFilter('search', (e.target as HTMLInputElement).value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <FilterSelect label="College" value={college} onChange={(v) => updateFilter('college', v)} options={masterColleges} />
            <FilterSelect label="Stream" value={stream} onChange={(v) => updateFilter('stream', v)} options={masterStreams} />
            <FilterSelect label="Year" value={year} onChange={(v) => updateFilter('year', v)} options={masterYears} />
            <FilterSelect label="Prev. Experience" value={prevExp} onChange={(v) => updateFilter('prev_experience', v)} options={['Yes', 'No']} />
            <FilterSelect label="Parent Permission" value={parentPerm} onChange={(v) => updateFilter('parent_permission', v)} options={['Yes', 'No']} />
            <FilterSelect label="Safety Shoes" value={shoes} onChange={(v) => updateFilter('safety_shoes', v)} options={['Yes', 'No', 'Already Have']} />
            <FilterSelect label="Availability" value={availability} onChange={(v) => updateFilter('availability', v)} options={['Yes', 'No']} />
            <FilterSelect label="Exceptions" value={hasExceptions} onChange={(v) => updateFilter('has_exceptions', v)} options={[{ label: 'Has Exceptions', value: 'true' }, { label: 'Clear Records', value: 'false' }]} />
            <FilterSelect label="Status" value={finalStatus} onChange={(v) => updateFilter('final_status', v)} options={['Registered', 'Interview Pending', 'Interview Completed', 'Selected', 'Waitlisted', 'Not Selected', 'Confirmed', 'Cancelled']} />
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider">
                <th className="px-3 py-3 font-semibold">Reg ID</th>
                <th className="px-3 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold text-center">Age</th>
                <th className="px-3 py-3 font-semibold">College</th>
                <th className="px-3 py-3 font-semibold">Stream</th>
                <th className="px-3 py-3 font-semibold text-center">Year</th>
                <th className="px-3 py-3 font-semibold text-center">Prev Exp</th>
                <th className="px-3 py-3 font-semibold text-center">Parent</th>
                <th className="px-3 py-3 font-semibold text-center">Shoes</th>
                <th className="px-3 py-3 font-semibold text-center">Available</th>
                <th className="px-3 py-3 font-semibold text-center">Exceptions</th>
                <th className="px-3 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={12} className="px-3 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : participants.length === 0 ? (
                <tr><td colSpan={12} className="px-3 py-8 text-center text-slate-400">No participants found.</td></tr>
              ) : (
                participants.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/participants/${p.id}`)}
                  >
                    <td className="px-3 py-2.5 font-mono text-xs text-indigo-600 font-medium">{p.registration_id}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{p.name || '—'}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{p.age || '—'}</td>
                    <td className="px-3 py-2.5 text-slate-600 max-w-[120px] truncate">{p.college || '—'}</td>
                    <td className="px-3 py-2.5 text-slate-600">{p.stream || '—'}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{p.education_year || '—'}</td>
                    <td className="px-3 py-2.5 text-center">{badge(p.prev_experience_crc, 'Yes')}</td>
                    <td className="px-3 py-2.5 text-center">{badge(p.parent_permission, 'Yes')}</td>
                    <td className="px-3 py-2.5 text-center">{badge(p.safety_shoes, 'Yes')}</td>
                    <td className="px-3 py-2.5 text-center">{badge(p.availability, 'Yes')}</td>
                    <td className="px-3 py-2.5 text-center">
                      {p.exceptions && p.exceptions.length > 0 ? (
                        <span className="bg-red-100 text-red-700 text-xs font-bold rounded-full px-2 py-0.5">{p.exceptions.length}</span>
                      ) : (
                        <span className="text-emerald-500 text-xs font-medium">Clear</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">{statusBadge(p.final_status || p.status)}</td>
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

// ─── Filter Select ───────────────────────────────────────

const FilterSelect = ({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | { label: string; value: string })[];
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
    >
      <option value="">All</option>
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const lbl = typeof o === 'string' ? o : o.label;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  </div>
);

export default Participants;
