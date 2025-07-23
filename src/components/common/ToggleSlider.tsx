import { type FC } from 'react';

type ToggleSliderProps = {
  isActive: boolean;
  onToggle: () => void;
  leftLabel: string;
  rightLabel: string;
  leftIcon: React.ReactNode;
  rightIcon: React.ReactNode;
  ariaLabel?: string;
}

export const ToggleSlider: FC<ToggleSliderProps> = ({
  isActive,
  onToggle,
  leftLabel,
  rightLabel,
  leftIcon,
  rightIcon,
  ariaLabel
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium transition-colors duration-200 ${
          !isActive 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span className="text-xs md:text-sm inline">{leftLabel}</span>
        </span>
        
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-12 sm:h-7 sm:w-14 cursor-pointer items-center rounded-full border-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
            isActive
              ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/25'
              : 'bg-gray-200 dark:bg-gray-700 border-gray-200 dark:border-gray-700'
          }`}
          aria-pressed={isActive}
          aria-label={ariaLabel || `Cambiar a ${isActive ? leftLabel.toLowerCase() : rightLabel.toLowerCase()}`}
        >
          <span
            className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
              isActive 
                ? 'translate-x-6 sm:translate-x-7' 
                : 'translate-x-1'
            }`}
          >
            <span className="absolute inset-0 flex items-center justify-center">
              {isActive ? (
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600">
                  {rightIcon}
                </span>
              ) : (
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600">
                  {leftIcon}
                </span>
              )}
            </span>
          </span>
        </button>
        
        <span className={`text-sm font-medium transition-colors duration-200 ${
          isActive 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span className="text-xs md:text-sm inline">{rightLabel}</span>
        </span>
      </div>
    </div>
  );
}; 