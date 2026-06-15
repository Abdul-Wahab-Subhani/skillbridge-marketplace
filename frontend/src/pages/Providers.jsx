import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/Loader';

const Providers = () => {
  const [params, setParams] = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const search = params.get('search') || '';
  const skill = params.get('skill') || '';

  useEffect(() => {
    setLoading(true);
    api
      .get('/providers', { params: { search, skill, limit: 24 } })
      .then(({ data }) => setProfiles(data.data))
      .finally(() => setLoading(false));
  }, [search, skill]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-brand-800 dark:text-white">Find Service Providers</h1>
        <div className="flex gap-2">
          <input
            placeholder="Search by name..."
            defaultValue={search}
            onBlur={(e) => setParams({ search: e.target.value, skill })}
            className="input"
          />
          <input
            placeholder="Filter by skill..."
            defaultValue={skill}
            onBlur={(e) => setParams({ search, skill: e.target.value })}
            className="input"
          />
        </div>
      </div>

      {loading ? (
        <Loader label="Loading providers..." />
      ) : profiles.length === 0 ? (
        <p className="mt-10 text-center text-brand-500 dark:text-brand-300">No providers found.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <Link
              key={p._id}
              to={`/providers/${p.user?._id}`}
              className="card flex flex-col gap-3 p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                {p.user?.avatar?.url ? (
                  <img src={p.user.avatar.url} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-500 dark:bg-brand-700">
                    {p.user?.name?.[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-brand-800 dark:text-white">{p.user?.name}</h3>
                  <p className="text-xs text-brand-500 dark:text-brand-300">{p.title || 'Service Provider'}</p>
                </div>
              </div>
              <p className="line-clamp-2 text-sm text-brand-500 dark:text-brand-300">{p.bio || 'No bio yet.'}</p>
              <div className="flex flex-wrap gap-1">
                {p.skills?.slice(0, 4).map((s) => (
                  <span key={s} className="badge bg-brand-50 text-brand-600 dark:bg-brand-700 dark:text-brand-200">{s}</span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-brand-100 pt-3 text-sm dark:border-brand-700">
                <div className="flex items-center gap-1 text-brand-500 dark:text-brand-300">
                  <Star size={14} className="fill-accent-500 text-accent-500" />
                  {p.avgRating?.toFixed(1) || 'New'} ({p.numReviews || 0})
                </div>
                <span className="font-semibold text-brand-800 dark:text-white">
                  ${p.hourlyRate}/hr
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Providers;
