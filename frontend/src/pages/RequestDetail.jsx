import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import ProjectTracker from '../components/ProjectTracker';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

const STATUS_ACTIONS = {
  customer: {
    Pending: ['Cancelled'],
    Accepted: ['Cancelled'],
    Completed: ['Delivered'],
  },
  provider: {
    Pending: ['Accepted', 'Rejected'],
    Accepted: ['In Progress'],
    'In Progress': ['Completed'],
  },
  admin: {
    Pending: ['Accepted', 'Rejected', 'Cancelled'],
    Accepted: ['In Progress', 'Cancelled'],
    'In Progress': ['Completed', 'Cancelled'],
    Completed: ['Delivered'],
  },
};

const RequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadRequest = () =>
    api.get(`/requests/${id}`).then(({ data }) => setRequest(data.data));

  useEffect(() => {
    loadRequest().finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await api.put(`/requests/${id}/status`, { status: newStatus, note });
      toast.success(`Status updated to "${newStatus}"`);
      setNote('');
      await loadRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { requestId: id, rating, comment });
      toast.success('Review submitted successfully!');
      await loadRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader label="Loading project..." />;
  if (!request) return <p className="py-16 text-center">Request not found.</p>;

  const role = user?.role;
  const availableActions = STATUS_ACTIONS[role]?.[request.status] || [];

  const isCustomer = user?._id === request.customer?._id;
  const canReview =
    isCustomer && request.status === 'Delivered' && !request.isReviewed;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-800 dark:text-white">
            {request.service?.title}
          </h1>
          <p className="mt-1 text-sm text-brand-500 dark:text-brand-300">
            Request #{request._id.slice(-6).toUpperCase()} ·{' '}
            {format(new Date(request.createdAt), 'PPP')}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Project Tracker */}
      <div className="mt-6 card p-5">
        <h2 className="mb-4 text-sm font-semibold text-brand-700 dark:text-brand-100">
          Project Progress
        </h2>
        <ProjectTracker status={request.status} />
      </div>

      {/* Details grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-700 dark:text-brand-100">Customer</h2>
          <div className="mt-2 flex items-center gap-3">
            {request.customer?.avatar?.url ? (
              <img src={request.customer.avatar.url} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-500 dark:bg-brand-700">
                {request.customer?.name?.[0]}
              </div>
            )}
            <div>
              <p className="font-medium text-brand-800 dark:text-white">{request.customer?.name}</p>
              <p className="text-xs text-brand-400">{request.customer?.email}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-700 dark:text-brand-100">Provider</h2>
          <div className="mt-2 flex items-center gap-3">
            {request.provider?.avatar?.url ? (
              <img src={request.provider.avatar.url} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-500 dark:bg-brand-700">
                {request.provider?.name?.[0]}
              </div>
            )}
            <div>
              <p className="font-medium text-brand-800 dark:text-white">{request.provider?.name}</p>
              <p className="text-xs text-brand-400">{request.provider?.email}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-700 dark:text-brand-100">Budget</h2>
          <p className="mt-1 text-xl font-bold text-brand-800 dark:text-white">${request.budget}</p>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-700 dark:text-brand-100">Deadline</h2>
          <p className="mt-1 text-lg font-semibold text-brand-800 dark:text-white">
            {format(new Date(request.deadline), 'PPP')}
          </p>
        </div>
      </div>

      {/* Requirements */}
      <div className="mt-4 card p-5">
        <h2 className="text-sm font-semibold text-brand-700 dark:text-brand-100">Requirements</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-brand-600 dark:text-brand-200">
          {request.requirements}
        </p>
      </div>

      {/* Status update actions */}
      {availableActions.length > 0 && (
        <div className="mt-6 card p-5">
          <h2 className="text-sm font-semibold text-brand-700 dark:text-brand-100">Update Status</h2>
          <input
            placeholder="Optional note..."
            className="input mt-3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {availableActions.map((action) => (
              <button
                key={action}
                onClick={() => handleStatusUpdate(action)}
                disabled={updating}
                className={`btn text-sm ${
                  action === 'Rejected' || action === 'Cancelled'
                    ? 'border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400'
                    : 'btn-primary'
                }`}
              >
                {updating ? 'Updating...' : `Mark as ${action}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status history */}
      <div className="mt-6 card p-5">
        <h2 className="text-sm font-semibold text-brand-700 dark:text-brand-100">
          Status History
        </h2>
        <ol className="mt-3 space-y-3">
          {[...request.statusHistory].reverse().map((entry, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent-500" />
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={entry.status} />
                  <span className="text-xs text-brand-400">
                    {format(new Date(entry.changedAt), 'PPp')}
                  </span>
                </div>
                {entry.note && (
                  <p className="mt-0.5 text-brand-500 dark:text-brand-300">{entry.note}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Review form */}
      {canReview && (
        <div className="mt-6 card border-accent-200 bg-accent-50 p-5 dark:border-accent-700 dark:bg-accent-500/5">
          <h2 className="font-semibold text-brand-800 dark:text-white">
            Leave a Review
          </h2>
          <p className="mt-1 text-sm text-brand-500 dark:text-brand-300">
            Your feedback helps other customers find great providers.
          </p>
          <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3">
            <div>
              <label className="label">Rating</label>
              <StarRating value={rating} onChange={setRating} size={26} />
            </div>
            <div>
              <label className="label">Comment (optional)</label>
              <textarea
                rows={3}
                className="input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
              />
            </div>
            <button type="submit" disabled={submittingReview} className="btn-accent">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {request.isReviewed && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          ✓ You have already reviewed this project.
        </div>
      )}
    </div>
  );
};

export default RequestDetail;
