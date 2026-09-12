import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit } from 'lucide-react';
import { activityApi } from '../../services/api';
import type { Activity } from '../../types/activity';
import { format } from 'date-fns';

const Activities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const data = await activityApi.getAll();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-slate-50 text-slate-600 border border-slate-200';
      case 'Registration Open': return 'bg-green-50 text-green-700 border border-green-200';
      case 'Registration Closed': return 'bg-red-50 text-red-700 border border-red-200';
      case 'Interview': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Completed': return 'bg-purple-50 text-purple-700 border border-purple-200';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Activities</h2>
          <p className="text-sm text-slate-500">Manage all registration activities</p>
        </div>
        <Link
          to="/admin/activities/new"
          className="bg-[#1a2332] hover:bg-[#263347] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Activity
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activities..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-72"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="px-5 py-3 font-semibold">Activity Name</th>
                <th className="px-5 py-3 font-semibold">Client / Unit</th>
                <th className="px-5 py-3 font-semibold">Location</th>
                <th className="px-5 py-3 font-semibold">Duration</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading activities...</td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No activities found. Create one to get started.</td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{activity.name}</td>
                    <td className="px-5 py-3 text-slate-600">{activity.client}</td>
                    <td className="px-5 py-3 text-slate-600">{activity.location}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs">
                      {format(new Date(activity.start_date), 'dd MMM yyyy')} –{' '}
                      {format(new Date(activity.end_date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(activity.status)}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/admin/activities/${activity.id}/edit`} className="text-slate-500 hover:text-slate-800 inline-flex items-center text-xs font-medium transition-colors">
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
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

export default Activities;
