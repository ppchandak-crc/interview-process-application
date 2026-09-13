import { useState, useEffect } from 'react';
import { mastersApi } from '../../services/api';
import { Plus, Save, X, Users, Building2, GraduationCap, BookOpen, Eye, EyeOff } from 'lucide-react';

const Masters = () => {
  const [tab, setTab] = useState<'colleges' | 'streams' | 'years' | 'users'>('users');
  const role = localStorage.getItem('role') || '';

  const tabs = [
    { key: 'users' as const, label: 'Users & Interviewers', icon: Users },
    { key: 'colleges' as const, label: 'Colleges', icon: Building2 },
    { key: 'streams' as const, label: 'Streams', icon: GraduationCap },
    { key: 'years' as const, label: 'Education Years', icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Masters & Settings</h2>
        <p className="text-sm text-slate-500">Manage system configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'users' && <UserManager isSuperAdmin={role === 'super_admin'} />}
      {tab === 'colleges' && <MasterList type="colleges" label="College" />}
      {tab === 'streams' && <MasterList type="streams" label="Stream" />}
      {tab === 'years' && <MasterList type="years" label="Education Year" />}
    </div>
  );
};

// ─── Master List CRUD ────────────────────────────────────

const MasterList = ({ type, label }: { type: 'colleges' | 'streams' | 'years'; label: string }) => {
  const [items, setItems] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetcher = type === 'colleges' ? mastersApi.getColleges : type === 'streams' ? mastersApi.getStreams : mastersApi.getYears;
  const creator = type === 'colleges' ? mastersApi.createCollege : type === 'streams' ? mastersApi.createStream : mastersApi.createYear;
  const updater = type === 'colleges' ? mastersApi.updateCollege : type === 'streams' ? mastersApi.updateStream : mastersApi.updateYear;

  useEffect(() => {
    fetcher().then(setItems).finally(() => setLoading(false));
  }, []);

  const addItem = async () => {
    if (!newName.trim()) return;
    try {
      const item = await creator(newName.trim());
      setItems([...items, item]);
      setNewName('');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed');
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const updated = await updater(id, { is_active: !isActive });
      setItems(items.map((i) => (i.id === id ? updated : i)));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-5 py-3 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900">{label} Master</h3>
      </div>
      <div className="p-5">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder={`Add new ${label.toLowerCase()}...`}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button onClick={addItem} className="bg-[#1a2332] hover:bg-[#263347] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <div key={item.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${item.is_active ? 'bg-slate-50' : 'bg-red-50 opacity-60'}`}>
                <span className={`text-sm font-medium ${item.is_active ? 'text-slate-800' : 'text-slate-500 line-through'}`}>{item.name}</span>
                <button
                  onClick={() => toggleActive(item.id, item.is_active)}
                  className={`text-xs font-medium px-2.5 py-1 rounded transition-colors ${item.is_active ? 'text-red-600 hover:bg-red-100' : 'text-emerald-600 hover:bg-emerald-100'}`}
                >
                  {item.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── User Manager ────────────────────────────────────────

const UserManager = ({ isSuperAdmin }: { isSuperAdmin: boolean }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', user_id: '', password: '', role: 'interviewer' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    mastersApi.getUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const createUser = async () => {
    if (!form.name || !form.user_id || !form.password) return;
    try {
      const u = await mastersApi.createUser(form);
      setUsers([...users, u]);
      setForm({ name: '', user_id: '', password: '', role: 'interviewer' });
      setShowForm(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed');
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const updated = await mastersApi.updateUser(id, { is_active: !isActive });
      setUsers(users.map((u) => (u.id === id ? updated : u)));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed');
    }
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      super_admin: 'bg-indigo-100 text-indigo-700',
      admin: 'bg-blue-100 text-blue-700',
      interviewer: 'bg-slate-100 text-slate-700',
    };
    return <span className={`text-xs font-medium px-2 py-0.5 rounded ${map[role] || 'bg-slate-100 text-slate-600'}`}>{role.replace('_', ' ')}</span>;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">User / Interviewer Master</h3>
        {isSuperAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="bg-[#1a2332] hover:bg-[#263347] text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
            {showForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> Add User</>}
          </button>
        )}
      </div>

      {showForm && (
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            <input type="text" placeholder="User ID" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 pr-9 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
              <option value="interviewer">Interviewer</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <button onClick={createUser} className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5">
            <Save className="w-4 h-4" /> Create User
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">User ID</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold text-center">Status</th>
              {isSuperAdmin && <th className="px-5 py-3 font-semibold text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-5 py-3 text-slate-600 font-mono text-xs">{u.user_id}</td>
                  <td className="px-5 py-3">{roleBadge(u.role)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-5 py-3 text-center">
                      {u.user_id === 'superadmin' ? (
                        <span className="text-xs font-medium text-slate-400 cursor-not-allowed">Primary</span>
                      ) : (
                        <button onClick={() => toggleActive(u.id, u.is_active)} className={`text-xs font-medium ${u.is_active ? 'text-red-600 hover:underline' : 'text-emerald-600 hover:underline'}`}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Masters;
