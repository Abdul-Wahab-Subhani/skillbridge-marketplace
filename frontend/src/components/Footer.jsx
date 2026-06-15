import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-brand-100 bg-white py-8 dark:border-brand-700 dark:bg-brand-800">
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-sm text-brand-500 dark:text-brand-300 sm:flex-row sm:justify-between sm:px-6">
      <p>© {new Date().getFullYear()} SkillBridge. Built for the Teyzix Core Internship (FSWD-1).</p>
      <div className="flex gap-4">
        <Link to="/services" className="hover:text-accent-500">Services</Link>
        <Link to="/providers" className="hover:text-accent-500">Providers</Link>
        <Link to="/register" className="hover:text-accent-500">Join as Provider</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
