import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Users, Briefcase, ShoppingBag, Star, Activity, UserX, UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';

const BigStat = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4 p-5">
    <div className={`rounded-full p-3 ${color}`}><Icon size={22} className="text-white" /></div>
    <div>
      <p className="text-xs text-brand-500 dark:text-brand-300">{label}</p>
      <p className="text-2xl font-extrabold text-brand-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/admin').then(({ data }) => setStats(data.data)),
      api.get('/admin/users?limit=20').then(({ data }) => setUsers(data.data)),
      api.get('/admin/activity?limit=30').then(({ data }) => setLogs(data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/status`, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => (u._id === userId ? data.data : u)));
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <Loader label="Loading admin panel..." />;
  if (!stats) return null;

  const TABS = ['overview', 'users', 'activity'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-800 dark:text-white">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-brand-500 dark:text-brand-300">
        Platform-wide analytics and management.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-brand-100 p-1 dark:bg-brand-700 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'bg-white shadow text-brand-800 dark:bg-brand-600 dark:text-white'
                : 'text-brand-500 hover:text-brand-700 dark:text-brand-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <BigStat icon={Users} label="Total Users" value={stats.totalUsers} color="bg-brand-600" />
            <BigStat icon={Briefcase} label="Services Listed" value={stats.totalServices} color="bg-sky-500" />
            <BigStat icon={ShoppingBag} label="Total Requests" value={stats.totalRequests} color="bg-accent-500" />
            <BigStat icon={Star} label="Reviews" value={stats.totalReviews} color="bg-amber-500" />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* Users by role */}
            <div className="card p-5">
              <h2 className="font-semibold text-brand-800 dark:text-white">Users by Role</h2>
              <div className="mt-4 space-y-3">
                {Object.entries(stats.usersByRole).map(([role, count]) => (
                  <div key={role} className="flex items-center gap-3">
                    <span className="w-20 text-sm capitalize text-brand-600 dark:text-brand-200">{role}</span>
                    <div className="flex-1 rounded-full bg-brand-100 dark:bg-brand-700">
                      <div
                        className="h-3 rounded-full bg-brand-500 dark:bg-brand-400"
                        style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-brand-700 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requests by status */}
            <div className="card p-5">
              <h2 className="font-semibold text-brand-800 dark:text-white">Requests by Status</h2>
              <div className="mt-4 space-y-2">
                {Object.entries(stats.requestsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <StatusBadge status={status} />
                    <span className="text-sm font-bold text-brand-700 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Services by category */}
            <div className="card p-5 sm:col-span-2">
              <h2 className="font-semibold text-brand-800 dark:text-white">Services by Category</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(stats.servicesByCategory).map(([cat, count]) => (
                  <div key={cat} className="rounded-lg bg-brand-50 px-3 py-2 dark:bg-brand-700 flex justify-between">
                    <span className="text-sm text-brand-600 dark:text-brand-200">{cat}</span>
                    <span className="text-sm font-bold text-brand-800 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent users */}
          {stats.recentUsers?.length > 0 && (
            <div className="mt-6 card p-5">
              <h2 className="font-semibold text-brand-800 dark:text-white">Recent Signups</h2>
              <div className="mt-3 space-y-2">
                {stats.recentUsers.map((u) => (
                  <div key={u._id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-brand-700 dark:text-white">{u.name}</span>
                      <span className="ml-2 text-brand-400">{u.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge bg-brand-50 text-brand-500 capitalize dark:bg-brand-700 dark:text-brand-200">
                        {u.role}
                      </span>
                      <span className="text-brand-400">{format(new Date(u.createdAt), 'PP')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="mt-6">
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 dark:bg-brand-700">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-brand-700 dark:text-brand-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 dark:divide-brand-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-brand-50 dark:hover:bg-brand-700/50">
                    <td className="px-4 py-3 font-medium text-brand-800 dark:text-white">{u.name}</td>
                    <td className="px-4 py-3 text-brand-500 dark:text-brand-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-brand-50 text-brand-600 capitalize dark:bg-brand-700 dark:text-brand-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="badge bg-emerald-100 text-emerald-700">Active</span>
                      ) : (
                        <span className="badge bg-red-100 text-red-600">Suspended</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-brand-400">{format(new Date(u.createdAt), 'PP')}</td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleUserStatus(u._id, u.isActive)}
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            u.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20'
                          }`}
                        >
                          {u.isActive ? <><UserX size={12} className="inline mr-1" />Suspend</> : <><UserCheck size={12} className="inline mr-1" />Activate</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity logs tab */}
      {tab === 'activity' && (
        <div className="mt-6 card divide-y divide-brand-100 dark:divide-brand-700">
          {logs.length === 0 ? (
            <p className="p-6 text-center text-brand-500">No activity logs yet.</p>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="flex items-start gap-3 px-5 py-3">
                <Activity size={16} className="mt-0.5 flex-shrink-0 text-accent-500" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-mono text-brand-600 dark:bg-brand-700 dark:text-brand-200">
                      {log.action}
                    </span>
                    {log.user && (
                      <span className="text-sm font-medium text-brand-700 dark:text-white">
                        {log.user.name}
                      </span>
                    )}
                  </div>
                  {log.description && (
                    <p className="mt-0.5 text-xs text-brand-400">{log.description}</p>
                  )}
                </div>
                <span className="flex-shrink-0 text-xs text-brand-400">
                  {format(new Date(log.createdAt), 'PPp')}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
