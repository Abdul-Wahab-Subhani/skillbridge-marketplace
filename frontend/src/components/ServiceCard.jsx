import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const ServiceCard = ({ service }) => {
  const cover = service.images?.[0]?.url;

  return (
    <Link
      to={`/services/${service._id}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-brand-100 dark:bg-brand-700">
        {cover ? (
          <img
            src={cover}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-300 dark:text-brand-500">
            <span className="text-sm font-medium">{service.category}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="badge bg-brand-50 text-brand-600 dark:bg-brand-700 dark:text-brand-200 w-fit">
          {service.category}
        </span>
        <h3 className="line-clamp-2 font-display text-base font-semibold text-brand-800 dark:text-white">
          {service.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-brand-500 dark:text-brand-300">
          {service.provider?.avatar?.url ? (
            <img
              src={service.provider.avatar.url}
              alt={service.provider.name}
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-brand-200 dark:bg-brand-600" />
          )}
          <span>{service.provider?.name}</span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-brand-100 pt-3 text-sm dark:border-brand-700">
          <div className="flex items-center gap-1 text-brand-500 dark:text-brand-300">
            <Clock size={14} />
            <span>{service.deliveryTime} day{service.deliveryTime > 1 ? 's' : ''}</span>
          </div>
          <div className="font-display text-base font-bold text-brand-800 dark:text-white">
            ${service.price}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
