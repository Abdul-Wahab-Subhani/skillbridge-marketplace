const Loader = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-brand-500 dark:text-brand-200">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-accent-500 dark:border-brand-600" />
    <p className="text-sm">{label}</p>
  </div>
);

export default Loader;
