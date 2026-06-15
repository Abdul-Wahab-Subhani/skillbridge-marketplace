import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  DollarSign, Briefcase, Clock, Star, Plus, Pencil, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-brand-600' }) => (
  <div className="card flex items-start gap-4 p-5">
    <div className={`rounded-full bg-brand-50 p-3 dark:bg-brand-700 ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-brand-500 dark:text-brand-300">{label}</p>
      <p className="text-xl font-bold text-brand-800 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-brand-400">{sub}</p>}
    </div>
  </div>
);

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [myServices, setMyServices] = useState([]);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/provider').then(({ data }) => setData(data.data)),
      api.get('/services/provider/mine').then(({ data }) => setMyServices(data.data)),
    ]).finally(() => {
      setLoadingMain(false);
      setLoadingServices(false);
    });
  }, []);

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      setMyServices((prev) => prev.filter((s) => s._id !== id));
      toast.success('Service deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loadingMain) return <Loader label="Loading dashboard..." />;
  if (!data) return null;

  const {
    pendingRequests, activeProjects, totalEarnings,
    completedProjects, avgRating, numReviews, servicesCount,
    earningsByMonth, statusBreakdown,
  } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800 dark:text-white">Provider Dashboard</h1>
          <p className="mt-1 text-sm text-brand-500 dark:text-brand-300">
            Manage your services, projects, and earnings.
          </p>
        </div>
        <Link to="/services/new" className="btn-accent">
          <Plus size={16} /> New Service
        </Link>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total Earnings" value={`$${totalEarnings}`} color="text-emerald-500" />
        <StatCard icon={Briefcase} label="Projects Done" value={completedProjects} color="text-accent-500" />
        <StatCard icon={Star} label="Avg. Rating"
          value={avgRating ? avgRating.toFixed(1) : '—'}
          sub={`${numReviews} review${numReviews !== 1 ? 's' : ''}`}
          color="text-amber-500"
        />
        <StatCard icon={Clock} label="Active Projects" value={activeProjects.length} color="text-sky-500" />
      </div>

      {/* Pending requests */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-brand-800 dark:text-white">
          Pending Requests{pendingRequests.length > 0 && (
            <span className="ml-2 badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {pendingRequests.length}
            </span>
          )}
        </h2>
        {pendingRequests.length === 0 ? (
          <p className="mt-3 text-sm text-brand-500 dark:text-brand-300">No pending requests at the moment.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingRequests.map((req) => (
              <Link
                key={req._id}
                to={`/requests/${req._id}`}
                className="card flex flex-col gap-2 p-4 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-brand-800 dark:text-white">{req.service?.title}</p>
                  <p className="text-xs text-brand-500 dark:text-brand-300">
                    From: {req.customer?.name} · Budget: ${req.budget} ·{' '}
                    {format(new Date(req.createdAt), 'PP')}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Active projects */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-brand-800 dark:text-white">Active Projects</h2>
        {activeProjects.length === 0 ? (
          <p className="mt-3 text-sm text-brand-500 dark:text-brand-300">No active projects.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {activeProjects.map((req) => (
              <Link
                key={req._id}
                to={`/requests/${req._id}`}
                className="card flex flex-col gap-2 p-4 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-brand-800 dark:text-white">{req.service?.title}</p>
                  <p className="text-xs text-brand-500 dark:text-brand-300">
                    Client: {req.customer?.name} · Deadline:{' '}
                    {format(new Date(req.deadline), 'PP')}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* My services */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-800 dark:text-white">My Services</h2>
          <Link to="/services/new" className="text-sm font-medium text-accent-500 hover:underline">
            + Add new
          </Link>
        </div>
        {loadingServices ? (
          <Loader label="Loading services..." />
        ) : myServices.length === 0 ? (
          <div className="mt-4 rounded-xl2 border border-dashed border-brand-200 p-8 text-center dark:border-brand-600">
            <p className="text-sm text-brand-500 dark:text-brand-300">No services listed yet.</p>
            <Link to="/services/new" className="btn-accent mt-3">Create First Service</Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {myServices.map((svc) => (
              <div
                key={svc._id}
                className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  {svc.images?.[0]?.url ? (
                    <img src={svc.images[0].url} alt="" className="h-12 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-700">
                      <Briefcase size={18} className="text-brand-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-brand-800 dark:text-white">{svc.title}</p>
                    <p className="text-xs text-brand-500 dark:text-brand-300">
                      {svc.category} · ${svc.price} · {svc.deliveryTime}d delivery
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {svc.isActive ? (
                    <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Active</span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">Inactive</span>
                  )}
                  <button
                    onClick={() => navigate(`/services/${svc._id}/edit`)}
                    className="rounded-lg p-2 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-700"
                    aria-label="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteService(svc._id)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Earnings chart (monthly breakdown) */}
      {earningsByMonth?.length > 0 && (
        <div className="mt-8 card p-5">
          <h2 className="font-semibold text-brand-800 dark:text-white">Monthly Earnings (Last 6 months)</h2>
          <div className="mt-4 space-y-2">
            {[...earningsByMonth].reverse().map((m) => (
              <div key={`${m._id.year}-${m._id.month}`} className="flex items-center gap-3">
                <span className="w-20 text-xs text-brand-500 dark:text-brand-300">
                  {new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short', year: '2-digit' })}
                </span>
                <div className="flex-1 rounded-full bg-brand-100 dark:bg-brand-700">
                  <div
                    className="h-3 rounded-full bg-accent-500"
                    style={{
                      width: `${Math.min(100, (m.total / (earningsByMonth[0]?.total || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-16 text-right text-xs font-semibold text-brand-700 dark:text-white">
                  ${m.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider profile quick edit link */}
      <div className="mt-8 card p-5">
        <h2 className="font-semibold text-brand-800 dark:text-white">Your Provider Profile</h2>
        <p className="mt-1 text-sm text-brand-500 dark:text-brand-300">
          Keep your profile updated to attract more customers.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/profile" className="btn-outline text-sm">Edit Account</Link>
          <Link to={`/providers/${null}`} className="btn-outline text-sm" onClick={(e) => e.preventDefault()}>
            Preview Public Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
