import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, DollarSign, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const ServiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ requirements: '', budget: '', deadline: '' });

  useEffect(() => {
    api
      .get(`/services/${id}`)
      .then(({ data }) => {
        setService(data.data.service);
        setProviderProfile(data.data.providerProfile);
        setForm((f) => ({ ...f, budget: data.data.service.price }));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in as a customer to submit a request');
      navigate('/login', { state: { from: `/services/${id}` } });
      return;
    }
    if (user.role !== 'customer') {
      toast.error('Only customer accounts can submit service requests');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/requests', {
        serviceId: id,
        requirements: form.requirements,
        budget: form.budget,
        deadline: form.deadline,
      });
      toast.success('Request submitted successfully!');
      navigate(`/requests/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading service..." />;
  if (!service) return <p className="py-16 text-center">Service not found.</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <span className="badge bg-brand-50 text-brand-600 dark:bg-brand-700 dark:text-brand-200">
            {service.category}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-brand-800 dark:text-white sm:text-3xl">
            {service.title}
          </h1>

          {service.images?.[0] && (
            <img
              src={service.images[0].url}
              alt={service.title}
              className="mt-4 aspect-video w-full rounded-xl2 object-cover"
            />
          )}

          <div className="mt-6 card p-5">
            <h2 className="font-semibold text-brand-800 dark:text-white">About this service</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-brand-600 dark:text-brand-200">
              {service.description}
            </p>
            {service.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {service.tags.map((t) => (
                  <span key={t} className="badge bg-brand-50 text-brand-500 dark:bg-brand-700 dark:text-brand-300">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Provider info */}
          <div className="mt-6 card p-5">
            <h2 className="font-semibold text-brand-800 dark:text-white">About the provider</h2>
            <Link to={`/providers/${service.provider._id}`} className="mt-3 flex items-center gap-4">
              {service.provider.avatar?.url ? (
                <img src={service.provider.avatar.url} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-500 dark:bg-brand-700">
                  {service.provider.name?.[0]}
                </div>
              )}
              <div>
                <p className="font-medium text-brand-800 dark:text-white">{service.provider.name}</p>
                {providerProfile && (
                  <div className="flex items-center gap-1 text-sm text-brand-500 dark:text-brand-300">
                    <Star size={14} className="fill-accent-500 text-accent-500" />
                    {providerProfile.avgRating?.toFixed(1) || 'New'} ({providerProfile.numReviews} reviews)
                  </div>
                )}
              </div>
            </Link>
            {providerProfile?.bio && (
              <p className="mt-3 text-sm text-brand-600 dark:text-brand-200">{providerProfile.bio}</p>
            )}
            {providerProfile?.skills?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {providerProfile.skills.map((s) => (
                  <span key={s} className="badge bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-300">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - order summary & request form */}
        <div>
          <div className="card sticky top-20 p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-2xl font-bold text-brand-800 dark:text-white">
                <DollarSign size={20} />{service.price}
              </span>
              <span className="flex items-center gap-1 text-sm text-brand-500 dark:text-brand-300">
                <Clock size={15} /> {service.deliveryTime}-day delivery
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <h3 className="font-semibold text-brand-800 dark:text-white">Submit a request</h3>
              <div>
                <label className="label">Requirements</label>
                <textarea
                  required
                  rows={4}
                  className="input"
                  placeholder="Describe what you need..."
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Your Budget ($)</label>
                <input
                  type="number"
                  min={0}
                  required
                  className="input"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Deadline</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={form.deadline}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-accent w-full">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              {user?.role === 'provider' && (
                <p className="text-xs text-brand-400">
                  Provider accounts cannot submit service requests.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
