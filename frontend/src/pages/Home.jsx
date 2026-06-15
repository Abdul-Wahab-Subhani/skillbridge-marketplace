import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Code2,
  PenTool,
  Megaphone,
  PenLine,
  Video,
  LayoutTemplate,
  TrendingUp,
  ShieldCheck,
  Workflow,
  Star,
} from 'lucide-react';
import api from '../api/axios';
import StarRating from '../components/StarRating';

const CATEGORIES = [
  { name: 'Web Development', icon: Code2 },
  { name: 'Graphic Design', icon: PenTool },
  { name: 'Digital Marketing', icon: Megaphone },
  { name: 'Content Writing', icon: PenLine },
  { name: 'Video Editing', icon: Video },
  { name: 'UI/UX Design', icon: LayoutTemplate },
];

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [topProviders, setTopProviders] = useState([]);

  useEffect(() => {
    api
      .get('/admin/top-providers')
      .then(({ data }) => setTopProviders(data.data))
      .catch(() => setTopProviders([]));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/services${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-700 text-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <span className="badge bg-white/10 text-accent-200">Multi-Vendor Service Marketplace</span>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Find skilled providers. Track every project, start to finish.
          </h1>
          <p className="mt-4 max-w-xl text-brand-100">
            SkillBridge connects customers with vetted freelancers for web development,
            design, writing, and marketing — with transparent pricing and real-time
            project tracking from request to delivery.
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Try 'logo design' or 'React website'"
                className="w-full rounded-lg border border-white/10 bg-white/10 py-3 pl-10 pr-3 text-sm text-white placeholder:text-brand-200 focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
            </div>
            <button type="submit" className="btn-accent">Search</button>
          </form>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-brand-200">
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-accent-400" /> Verified providers</div>
            <div className="flex items-center gap-2"><Workflow size={16} className="text-accent-400" /> Live project tracking</div>
            <div className="flex items-center gap-2"><TrendingUp size={16} className="text-accent-400" /> Transparent pricing</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-brand-800 dark:text-white">Popular categories</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map(({ name, icon: Icon }) => (
            <Link
              key={name}
              to={`/services?category=${encodeURIComponent(name)}`}
              className="card flex flex-col items-center gap-3 p-5 text-center transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div className="rounded-full bg-accent-50 p-3 text-accent-500 dark:bg-accent-500/10">
                <Icon size={22} />
              </div>
              <span className="text-sm font-medium text-brand-700 dark:text-brand-100">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brand-50 py-14 dark:bg-brand-800/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-800 dark:text-white">How SkillBridge works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { step: '01', title: 'Browse & request', desc: 'Search services by category, compare providers, and submit a request with your requirements, budget, and deadline.' },
              { step: '02', title: 'Track progress', desc: 'Follow your project through Pending, Accepted, In Progress, Completed, and Delivered — updated in real time.' },
              { step: '03', title: 'Review & repeat', desc: 'Rate your provider out of 5 stars and leave feedback that helps the next customer choose with confidence.' },
            ].map((item) => (
              <div key={item.step} className="card p-6">
                <span className="font-display text-3xl font-extrabold text-accent-500/40">{item.step}</span>
                <h3 className="mt-3 text-lg font-semibold text-brand-800 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-brand-500 dark:text-brand-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top providers */}
      {topProviders.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-brand-800 dark:text-white">Top-rated providers</h2>
            <Link to="/providers" className="text-sm font-medium text-accent-500 hover:underline">View all</Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topProviders.map((p) => (
              <Link key={p._id} to={`/providers/${p.user?._id}`} className="card flex items-center gap-4 p-4 hover:shadow-md">
                {p.user?.avatar?.url ? (
                  <img src={p.user.avatar.url} alt={p.user.name} className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-500 dark:bg-brand-700">
                    {p.user?.name?.[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-brand-800 dark:text-white">{p.user?.name}</h3>
                  <p className="text-xs text-brand-500 dark:text-brand-300">{p.title || 'Service Provider'}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <StarRating value={p.avgRating} size={14} />
                    <span className="text-xs text-brand-500 dark:text-brand-300">
                      {p.avgRating?.toFixed(1)} ({p.numReviews})
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="card flex flex-col items-center justify-between gap-4 bg-brand-700 p-8 text-white sm:flex-row">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Are you a freelancer or agency?</h2>
            <p className="mt-1 text-sm text-brand-100">List your services and start receiving requests today.</p>
          </div>
          <Link to="/register" className="btn-accent whitespace-nowrap">
            <Star size={16} /> Become a Provider
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
