import { Check } from 'lucide-react';

const STEPS = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Delivered'];

/**
 * Visual horizontal stepper for the project tracking workflow.
 * Renders nothing special for terminal states (Rejected/Cancelled) -
 * those are shown via StatusBadge instead, by the parent.
 */
const ProjectTracker = ({ status }) => {
  const currentIndex = STEPS.indexOf(status);
  const isTerminalNegative = status === 'Rejected' || status === 'Cancelled';

  if (isTerminalNegative) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
        This project was <strong>{status.toLowerCase()}</strong> and is no longer active.
      </div>
    );
  }

  return (
    <div className="flex w-full items-center overflow-x-auto pb-2">
      {STEPS.map((step, idx) => {
        const completed = idx < currentIndex;
        const active = idx === currentIndex;
        return (
          <div key={step} className="flex flex-1 items-center min-w-[90px]">
            <div className="flex flex-col items-center text-center flex-shrink-0">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  completed
                    ? 'bg-accent-500 text-white'
                    : active
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-700'
                    : 'bg-brand-100 text-brand-400 dark:bg-brand-700 dark:text-brand-400'
                }`}
              >
                {completed ? <Check size={16} /> : idx + 1}
              </div>
              <span
                className={`mt-1 text-[11px] font-medium ${
                  active ? 'text-brand-700 dark:text-brand-100' : 'text-brand-400'
                }`}
              >
                {step}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${
                  completed ? 'bg-accent-500' : 'bg-brand-100 dark:bg-brand-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProjectTracker;
