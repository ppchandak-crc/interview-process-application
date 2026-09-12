import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityApi } from '../../services/api';
import type { Activity } from '../../types/activity';

const Dashboard = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    activityApi.getAll().then(setActivities).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-sm text-slate-500">Summary of system activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Total Activities</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{activities.length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Open for Registration</p>
          <p className="text-3xl font-bold text-green-700 mt-1">
            {activities.filter(a => a.status === 'Registration Open').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Completed</p>
          <p className="text-3xl font-bold text-slate-400 mt-1">
            {activities.filter(a => a.status === 'Completed').length}
          </p>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="px-5 py-3 font-semibold">Activity Name</th>
                <th className="px-5 py-3 font-semibold">Client</th>
                <th className="px-5 py-3 font-semibold">Location</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">No activities yet.</td>
                </tr>
              ) : (
                activities.map((a) => (
                  <tr 
                    key={a.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/activities/${a.id}/edit`)}
                  >
                    <td className="px-5 py-3 font-medium text-slate-800">{a.name}</td>
                    <td className="px-5 py-3 text-slate-600">{a.client}</td>
                    <td className="px-5 py-3 text-slate-600">{a.location}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        a.status === 'Registration Open' ? 'bg-green-50 text-green-700 border border-green-200' :
                        a.status === 'Draft' ? 'bg-slate-50 text-slate-600 border border-slate-200' :
                        a.status === 'Interview' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        a.status === 'Completed' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>{a.status}</span>
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

export default Dashboard;
