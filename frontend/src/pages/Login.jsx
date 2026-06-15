import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const dashboardPathFor = (role) => {
  if (role === 'provider') return '/dashboard/provider';
  if (role === 'admin') return '/dashboard/admin';
  return '/dashboard/customer';
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.name}!`);
      const redirectTo = location.state?.from || dashboardPathFor(data.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-brand-800 dark:text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-brand-500 dark:text-brand-300">
          Log in to manage your projects and requests.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-accent w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-500 dark:text-brand-300">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-accent-500 hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-6 rounded-lg bg-brand-50 p-3 text-xs text-brand-500 dark:bg-brand-700 dark:text-brand-300">
          <strong>Demo accounts</strong> (after running the seed script):<br />
          admin@demo.com · provider@demo.com · customer@demo.com — password: <code>password123</code>
        </div>
      </div>
    </div>
  );
};

export default Login;
