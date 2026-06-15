import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form);
      toast.success('Account created successfully!');
      const dest =
        data.role === 'provider'
          ? '/dashboard/provider'
          : data.role === 'admin'
          ? '/dashboard/admin'
          : '/dashboard/customer';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-brand-800 dark:text-white">Create your account</h1>
        <p className="mt-1 text-sm text-brand-500 dark:text-brand-300">
          Join SkillBridge as a customer or service provider.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe"
            />
          </div>
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
              minLength={6}
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="label">I want to join as</label>
            <div className="grid grid-cols-2 gap-3">
              {['customer', 'provider'].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setForm({ ...form, role })}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                    form.role === role
                      ? 'border-accent-500 bg-accent-50 text-accent-600 dark:bg-accent-500/10'
                      : 'border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-600 dark:text-brand-200'
                  }`}
                >
                  {role === 'customer' ? 'Customer' : 'Service Provider'}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-accent w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-500 dark:text-brand-300">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
