import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Briefcase, Star } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/Loader';
import ServiceCard from '../components/ServiceCard';
import StarRating from '../components/StarRating';

const ProviderProfilePublic = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/providers/${id}`),
      api.get(`/reviews/provider/${id}`),
    ])
      .then(([profileRes, reviewsRes]) => {
        setProfile(profileRes.data.data.profile);
        setServices(profileRes.data.data.services);
        setReviews(reviewsRes.data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading profile..." />;
  if (!profile) return <p className="py-16 text-center">Provider not found.</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {profile.user?.avatar?.url ? (
            <img src={profile.user.avatar.url} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-500 dark:bg-brand-700">
              {profile.user?.name?.[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-brand-800 dark:text-white">{profile.user?.name}</h1>
            <p className="text-brand-500 dark:text-brand-300">{profile.title || 'Service Provider'}</p>
            <div className="mt-1 flex items-center gap-2">
              <StarRating value={profile.avgRating} />
              <span className="text-sm text-brand-500 dark:text-brand-300">
                {profile.avgRating?.toFixed(1) || '0.0'} ({profile.numReviews} reviews)
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-brand-800 dark:text-white">{profile.experienceYears}</p>
            <p className="text-xs text-brand-500 dark:text-brand-300">Years exp.</p>
          </div>
          <div>
            <p className="text-xl font-bold text-brand-800 dark:text-white">{profile.completedProjects}</p>
            <p className="text-xs text-brand-500 dark:text-brand-300">Projects done</p>
          </div>
          <div>
            <p className="text-xl font-bold text-brand-800 dark:text-white">${profile.hourlyRate}</p>
            <p className="text-xs text-brand-500 dark:text-brand-300">Per hour</p>
          </div>
        </div>
      </div>

      {/* Bio & skills */}
      <div className="mt-6 card p-6">
        <h2 className="font-semibold text-brand-800 dark:text-white">About</h2>
        <p className="mt-2 text-sm text-brand-600 dark:text-brand-200">{profile.bio || 'No bio added yet.'}</p>
        {profile.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <span key={s} className="badge bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-300">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio */}
      {profile.portfolio?.length > 0 && (
        <div className="mt-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-800 dark:text-white">
            <Briefcase size={18} /> Portfolio
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.portfolio.map((item) => (
              <div key={item._id} className="card overflow-hidden">
                {item.image?.url && (
                  <img src={item.image.url} alt={item.title} className="aspect-video w-full object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-brand-800 dark:text-white">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-brand-500 dark:text-brand-300">{item.description}</p>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-accent-500 hover:underline">
                      View project →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {services.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-brand-800 dark:text-white">Services offered</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => <ServiceCard key={s._id} service={{ ...s, provider: profile.user }} />)}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-brand-800 dark:text-white">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-brand-500 dark:text-brand-300">No reviews yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {r.customer?.avatar?.url ? (
                      <img src={r.customer.avatar.url} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-500 dark:bg-brand-700">
                        {r.customer?.name?.[0]}
                      </div>
                    )}
                    <span className="text-sm font-medium text-brand-800 dark:text-white">{r.customer?.name}</span>
                  </div>
                  <StarRating value={r.rating} size={14} />
                </div>
                {r.comment && <p className="mt-2 text-sm text-brand-600 dark:text-brand-200">{r.comment}</p>}
                {r.service?.title && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-brand-400">
                    <Star size={12} /> {r.service.title}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderProfilePublic;
