import { useSignals } from '@preact/signals-react/runtime';
import { type FC, type MouseEvent, useState } from 'react';

import { useStatus } from '@/hooks/useStatus';
import { favorites,toggleFavorite } from '@/store/signals';
import { type Show } from '@/types/movie';

import { FavoriteIcon } from './Icons/FavoriteIcon';
import { MovieIcon } from './Icons/MovieIcon';
import { StarIcon } from './Icons/StarIcon';

type ShowCardProps = {
  show: Show;
  onClick: () => void;
};

export const ShowCard: FC<ShowCardProps> = ({ show, onClick }) => {
  useSignals();
  const isShowFavorite = favorites.value.includes(show.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const { status } = useStatus(show.status);

  const handleFavoriteClick = (e: MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(show.id);
  };

  const handleExpandClick = (e: MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const cleanSummary = show.summary ? show.summary.replace(/<[^>]*>/g, '') : '';

  return (
    <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col h-full" onClick={onClick}>
      <div className="relative aspect-[2/3] mb-3 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 shadow-lg">
        {show.image?.medium ? (
          <img
            src={show.image.medium}
            alt={show.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
            <MovieIcon />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 cursor-pointer ${isShowFavorite ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/25' : 'bg-white/20 text-white hover:bg-white/30 shadow-lg'
            }`}
          aria-label={isShowFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <FavoriteIcon isActive={isShowFavorite} />
        </button>

        {show.rating.average && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs sm:text-sm font-semibold shadow-lg border border-white/10">
            <div className="flex items-center gap-1">
              <StarIcon size="w-3 h-3" />
              <span>{show.rating.average}</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-1">
        <h3 className="font-semibold text-nowrap overflow-ellipsis text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
          {show.name}
        </h3>

        {show.genres.length > 0 ? (
          <div className="flex gap-1 mb-2 h-6 overflow-hidden">
            {show.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium border border-blue-200 dark:border-blue-700 flex-shrink-0"
              >
                {genre}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex gap-1 mb-2 h-6 overflow-hidden">
            <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium border border-blue-200 dark:border-blue-700 flex-shrink-0">
              N/A
            </span>
          </div>
        )}

        {cleanSummary && (
          <div className="mb-2">
            <p className={`text-xs text-gray-600 dark:text-gray-400 leading-relaxed transition-all duration-300 ${isExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}>
              {cleanSummary}
            </p>
            {cleanSummary.length > 45 ? (
              <button onClick={handleExpandClick} className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 font-medium transition-colors cursor-pointer">
                {isExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            ) : (
              <div className="h-6"></div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="font-medium">{show.premiered ? new Date(show.premiered).getFullYear() : 'N/A'}</span>
          </div>

          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-1.5 ${status.color} animate-pulse`}></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">{status.status}</span>
          </div>
        </div>

        <div className="mt-2 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};
