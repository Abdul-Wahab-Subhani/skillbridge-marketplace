import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import api from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import Loader from '../components/Loader';

const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Video Editing',
  'UI/UX Design',
  'SEO',
  'Other',
];

const Services = () => {
  const [params, setParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    setLoading(true);
    api
      .get('/services', {
        params: { search, category, minPrice, maxPrice, page, limit: 9 },
      })
      .then(({ data }) => {
        setServices(data.data);
        setMeta({ total: data.total, pages: data.pages });
      })
      .finally(() => setLoading(false));
  }, [search, category, minPrice, maxPrice, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-brand-800 dark:text-white">Browse Services</h1>
        <input
          defaultValue={search}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
          onBlur={(e) => updateParam('search', e.target.value)}
          placeholder="Search services..."
          className="input max-w-xs"
        />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 text-sm text-brand-500 dark:text-brand-300">
          <SlidersHorizontal size={16} /> Filters:
        </div>
        <select
          className="input w-auto"
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min price"
          className="input w-28"
          defaultValue={minPrice}
          onBlur={(e) => updateParam('minPrice', e.target.value)}
        />
        <input
          type="number"
          placeholder="Max price"
          className="input w-28"
          defaultValue={maxPrice}
          onBlur={(e) => updateParam('maxPrice', e.target.value)}
        />
        {(category || minPrice || maxPrice || search) && (
          <button
            onClick={() => setParams({})}
            className="text-sm font-medium text-accent-500 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <Loader label="Loading services..." />
      ) : services.length === 0 ? (
        <div className="mt-12 text-center text-brand-500 dark:text-brand-300">
          No services match your filters yet. Try a different category or search term.
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-brand-500 dark:text-brand-300">{meta.total} result(s)</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s._id} service={s} />
            ))}
          </div>

          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('page', String(p))}
                  className={`h-9 w-9 rounded-lg text-sm font-medium ${
                    p === page
                      ? 'bg-accent-500 text-white'
                      : 'border border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-600 dark:text-brand-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Services;
