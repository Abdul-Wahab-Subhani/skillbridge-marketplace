import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun, LayoutDashboard, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const dashboardPathFor = (role) => {
  if (role === 'provider') return '/dashboard/provider';
  if (role === 'admin') return '/dashboard/admin';
  return '/dashboard/customer';
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-accent-500 text-white'
        : 'text-brand-700 hover:bg-brand-50 dark:text-brand-100 dark:hover:bg-brand-700'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur dark:border-brand-700 dark:bg-brand-800/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-brand-700 dark:text-white">
          <Briefcase className="text-accent-500" size={22} />
          SkillBridge
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/services" className={linkClass}>Browse Services</NavLink>
          <NavLink to="/providers" className={linkClass}>Find Providers</NavLink>
          {user && (
            <NavLink to={dashboardPathFor(user.role)} className={linkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-brand-500 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-700"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <>
              <Link to="/profile" className="text-sm font-medium text-brand-700 dark:text-brand-100">
                Hi, {user.name?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn-outline px-3 py-1.5 text-sm">
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline px-3 py-1.5 text-sm">Login</Link>
              <Link to="/register" className="btn-accent px-3 py-1.5 text-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="border-t border-brand-100 px-4 py-3 dark:border-brand-700 md:hidden">
          <nav className="flex flex-col gap-1">
            <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/services" className={linkClass} onClick={() => setOpen(false)}>Browse Services</NavLink>
            <NavLink to="/providers" className={linkClass} onClick={() => setOpen(false)}>Find Providers</NavLink>
            {user && (
              <NavLink to={dashboardPathFor(user.role)} className={linkClass} onClick={() => setOpen(false)}>
                <LayoutDashboard size={15} className="mr-1 inline" /> Dashboard
              </NavLink>
            )}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="btn-outline px-3 py-1.5 text-sm"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />} Theme
              </button>
              {user ? (
                <button onClick={handleLogout} className="btn-outline px-3 py-1.5 text-sm">
                  <LogOut size={15} /> Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-outline px-3 py-1.5 text-sm" onClick={() => setOpen(false)}>Login</Link>
                  <Link to="/register" className="btn-accent px-3 py-1.5 text-sm" onClick={() => setOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
