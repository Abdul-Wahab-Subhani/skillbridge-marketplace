import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
    <p className="font-display text-8xl font-extrabold text-brand-100 dark:text-brand-700">404</p>
    <h1 className="mt-2 text-2xl font-bold text-brand-800 dark:text-white">Page not found</h1>
    <p className="mt-2 max-w-sm text-brand-500 dark:text-brand-300">
      The page you&apos;re looking for doesn&apos;t exist or has been moved.
    </p>
    <Link to="/" className="btn-accent mt-6">Go back home</Link>
  </div>
);

export default NotFound;
