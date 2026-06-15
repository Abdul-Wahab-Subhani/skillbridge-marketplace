const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Accepted: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  'In Progress': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-300',
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
    {status}
  </span>
);

export default StatusBadge;
