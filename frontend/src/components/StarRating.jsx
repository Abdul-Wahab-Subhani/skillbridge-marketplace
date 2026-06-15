import { Star } from 'lucide-react';

/**
 * Displays a star rating. If `onChange` is provided, renders an
 * interactive 1-5 star selector (used in the review form).
 */
const StarRating = ({ value = 0, onChange, size = 18 }) => {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === 'function';

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${star} star`}
        >
          <Star
            size={size}
            className={
              star <= Math.round(value)
                ? 'fill-accent-500 text-accent-500'
                : 'fill-transparent text-brand-300 dark:text-brand-500'
            }
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
