import { useSignals } from '@preact/signals-react/runtime';
import { type FC } from 'react';

import { ToggleSlider } from '@/components/common/ToggleSlider';
import { ArrowLeftIcon } from '@/components/Icons/ArrowLeftIcon';
import { FavoriteIcon } from '@/components/Icons/FavoriteIcon';
import { InfiniteScrollIcon } from '@/components/Icons/InfiniteScrollICon';
import { PaginationIcon } from '@/components/Icons/PaginationIcon';
import { ITEMS_PER_PAGE } from '@/config/items';
import { currentPage, favorites, isInfiniteScroll, shows, toggleFavorite } from '@/store/signals';
import { type Show } from '@/types/movie';

type HeaderProps = {
  onToggleMode?: () => void;
  isDetail?: boolean;
  onBack?: () => void;
  show?: Show;
}

export const Header: FC<HeaderProps> = ({ 
  onToggleMode, 
  isDetail = false, 
  onBack, 
  show 
}) => {
  useSignals();
  
  const totalPages = Math.ceil(shows.value.length / ITEMS_PER_PAGE);
  const isShowFavorite = show ? favorites.value.includes(show.id) : false;

  const handleFavoriteClick = () => {
    if (show) {
      toggleFavorite(show.id);
    }
  };

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <div className="flex items-center justify-center sm:justify-start">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Show Explorer
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                {isDetail 
                  ? "Información detallada de la serie"
                  : isInfiniteScroll.value 
                    ? "Descubre series con scroll infinito" 
                    : "Descubre y organiza tus series favoritas"
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-row justify-center items-center gap-4 sm:gap-6">
            {isDetail && onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all duration-200 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 group cursor-pointer"
              >
                <ArrowLeftIcon />
                <span className="hidden sm:inline text-sm md:text-base">Volver a la lista</span>
                <span className="sm:hidden text-sm">Volver</span>
              </button>
            ) : (
              <>
                {onToggleMode && (
                  <ToggleSlider
                    isActive={isInfiniteScroll.value}
                    onToggle={onToggleMode}
                    leftLabel="Paginación"
                    rightLabel="Scroll Infinito"
                    leftIcon={<PaginationIcon />}
                    rightIcon={<InfiniteScrollIcon />}
                    ariaLabel={`Cambiar a ${isInfiniteScroll.value ? 'paginación' : 'scroll infinito'}`}
                  />
                )}
                
                <div className="text-center sm:text-right">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 inline-block border border-gray-200 dark:border-gray-700">
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                      {shows.value.length} series
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      {isInfiniteScroll.value ? 'Página infinita' : `Página ${currentPage.value + 1} de ${totalPages}`}
                    </p>
                  </div>
                </div>
              </>
            )}

            {isDetail && show && (
              <button
                onClick={handleFavoriteClick}
                className={`inline-flex sm:flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-200 font-medium cursor-pointer ${
                  isShowFavorite 
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <FavoriteIcon isActive={isShowFavorite} size="w-4 h-4" />
                <span className="hidden sm:inline text-sm md:text-base">
                  {isShowFavorite ? 'En favoritos' : 'Agregar a favoritos'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 