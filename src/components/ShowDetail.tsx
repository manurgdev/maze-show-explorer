import { useSignals } from '@preact/signals-react/runtime';
import { type FC } from 'react';

import { useStatus } from '@/hooks/useStatus';
import { type Show } from '@/types/movie';

import { ClockIcon } from './Icons/ClockIcon';
import { ExternalLinkIcon } from './Icons/ExternalLinkIcon';
import { FileIcon } from './Icons/FileIcon';
import { IMDbIcon } from './Icons/IMBdIcon';
import { InfoIcon } from './Icons/InfoIcon';
import { MovieIcon } from './Icons/MovieIcon';
import { StarIcon } from './Icons/StarIcon';
import { Header } from './Layout/Header';

type ShowDetailProps = {
  show: Show;
  onBack: () => void;
}

export const ShowDetail: FC<ShowDetailProps> = ({ show, onBack }) => {
  useSignals();
  const { status } = useStatus(show.status);

  const stripHtml = (html: string | null): string => {
    if (!html) return 'Sin descripción disponible';
    return html.replace(/<[^>]*>/g, '');
  };

  const formatDays = (days: string[]): string => {
    if (!days || days.length === 0) return 'N/A';
    return days.join(', ');
  };

  const availableImage = show.image?.original || show.image?.medium || null;

  const ImageElement = () => {
    if (availableImage) {
      return (
        <img 
          src={availableImage} 
          alt={show.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          loading="lazy"
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
        <MovieIcon />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      
      <Header 
        isDetail={true} 
        onBack={onBack} 
        show={show} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-5 lg:gap-12 xl:gap-16">
          
          <div className="lg:col-span-2 mb-8 lg:mb-0">
            <div className="relative">
              <div 
                className="aspect-[2/3] sm:aspect-[3/4] max-w-xs sm:max-w-md mx-auto lg:max-w-none overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 shadow-2xl"
              >
                <ImageElement />
              </div>

              {show.rating.average && (
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <StarIcon />
                    <span className="font-bold text-gray-900 dark:text-white">{show.rating.average}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/10</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
            
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                {show.name}
              </h1>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    status.color
                  } animate-pulse`}></div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {status.status}
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {show.premiered ? new Date(show.premiered).getFullYear() : 'N/A'}
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {show.type}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                {show.genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-sm px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium border border-blue-200 dark:border-blue-700"
                  >
                    {genre}
                  </span>
                ))}
                {show.genres.length === 0 && (
                  <span className="text-sm px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium border border-blue-200 dark:border-blue-700">
                    N/A
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <FileIcon />
                Sinopsis
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {stripHtml(show.summary)}
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <InfoIcon />
                  Información General
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Tipo:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{show.type}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Idioma:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{show.language}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Estreno:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {show.premiered ? new Date(show.premiered).toLocaleDateString('es-ES') : 'N/A'}
                    </span>
                  </div>
                  {show.ended && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Final:</span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {new Date(show.ended).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <ClockIcon />
                  Emisión
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Duración:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {show.runtime || show.averageRuntime || 'N/A'} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Días:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{formatDays(show.schedule.days)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Hora:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{show.schedule.time || 'N/A'}</span>
                  </div>
                  {show.network && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Red:</span>
                      <span className="text-gray-900 dark:text-white font-semibold">{show.network.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <ExternalLinkIcon className="size-5 text-blue-600" />
                Enlaces Externos
              </h3>
              <div className="flex flex-wrap gap-4">
                {show.officialSite && (
                  <a
                    href={show.officialSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transform hover:scale-105"
                  >
                    <ExternalLinkIcon />
                    Sitio Oficial
                  </a>
                )}
                
                {show.externals.imdb && (
                  <a
                    href={`https://www.imdb.com/title/${show.externals.imdb}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transform hover:scale-105"
                  >
                    <IMDbIcon />
                    Ver en IMDb
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 