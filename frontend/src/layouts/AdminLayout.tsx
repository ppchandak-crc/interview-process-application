import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, FileText, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Admin';
  const role = localStorage.getItem('role') || '';

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Participants', path: '/admin/participants', icon: Users },
    { name: 'Activities', path: '/admin/activities', icon: CalendarDays },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Masters & Users', path: '/admin/masters', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1a2332] text-slate-300 flex flex-col shrink-0">
        <div className="px-5 pt-6 pb-4 border-b border-white/10">
          <h1 className="text-sm font-bold text-white tracking-wide leading-tight">Participant Registration,<br />Interview & Selection</h1>
          <p className="text-xs text-slate-500 mt-1.5">Admin Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 mb-3">
            <p className="text-xs text-white font-medium truncate">{userName}</p>
            <p className="text-xs text-slate-500 capitalize">{role.replace('_', ' ')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 shrink-0">
          <h2 className="text-base font-semibold text-slate-800">
            {navItems.find((item) => location.pathname.startsWith(item.path))?.name || 'Dashboard'}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
