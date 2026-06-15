import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ShoppingBag, CheckCircle2, DollarSign, Settings } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';

const StatCard = ({ icon: Icon, label, value, color = 'text-brand-700' }) => (
  <div className="card flex items-center gap-4 p-5">
    <div className={`rounded-full bg-brand-50 p-3 dark:bg-brand-700 ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-brand-500 dark:text-brand-300">{label}</p>
      <p className="text-xl font-bold text-brand-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const CustomerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/customer')
      .then(({ data }) => setData(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (!data) return null;

  const { activeRequests, completedProjects, totalSpent, statusBreakdown } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800 dark:text-white">Customer Dashboard</h1>
          <p className="mt-1 text-sm text-brand-500 dark:text-brand-300">
            Track your service requests and project progress.
          </p>
        </div>
        <Link to="/services" className="btn-accent">Browse Services</Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Active Requests" value={activeRequests.length} color="text-sky-500" />
        <StatCard icon={CheckCircle2} label="Completed Projects" value={completedProjects.length} color="text-emerald-500" />
        <StatCard icon={DollarSign} label="Total Spent" value={`$${totalSpent}`} color="text-accent-500" />
        <StatCard icon={Settings} label="Pending Review" value={statusBreakdown?.Delivered || 0} color="text-amber-500" />
      </div>

      {/* Active requests */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-brand-800 dark:text-white">Active Requests</h2>
        {activeRequests.length === 0 ? (
          <div className="mt-4 rounded-xl2 border border-dashed border-brand-200 p-8 text-center dark:border-brand-600">
            <ShoppingBag className="mx-auto mb-2 text-brand-300" size={32} />
            <p className="text-sm text-brand-500 dark:text-brand-300">No active requests yet.</p>
            <Link to="/services" className="btn-accent mt-3">Find a Service</Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {activeRequests.map((req) => (
              <Link
                key={req._id}
                to={`/requests/${req._id}`}
                className="card flex flex-col gap-3 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-brand-800 dark:text-white">{req.service?.title}</p>
                  <p className="text-xs text-brand-500 dark:text-brand-300">
                    {req.service?.category} · Provider: {req.provider?.name} ·{' '}
                    {format(new Date(req.createdAt), 'PP')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-brand-700 dark:text-white">${req.budget}</span>
                  <StatusBadge status={req.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Completed projects */}
      {completedProjects.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-brand-800 dark:text-white">Delivered Projects</h2>
          <div className="mt-4 space-y-3">
            {completedProjects.map((req) => (
              <Link
                key={req._id}
                to={`/requests/${req._id}`}
                className="card flex flex-col gap-3 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-brand-800 dark:text-white">{req.service?.title}</p>
                  <p className="text-xs text-brand-500 dark:text-brand-300">
                    Provider: {req.provider?.name} · Delivered {format(new Date(req.updatedAt), 'PP')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-brand-700 dark:text-white">${req.budget}</span>
                  <StatusBadge status={req.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-8 card p-5">
        <h2 className="font-semibold text-brand-800 dark:text-white">Quick Links</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/profile" className="btn-outline text-sm">Edit Profile</Link>
          <Link to="/providers" className="btn-outline text-sm">Find Providers</Link>
          <Link to="/services" className="btn-outline text-sm">Browse All Services</Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
