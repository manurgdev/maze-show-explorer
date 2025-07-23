

type FavoriteIconProps = {
  isActive: boolean;
  size?: string;
}

export const FavoriteIcon = ({ isActive, size = 'w-3 h-3 sm:w-4 sm:h-4' }: FavoriteIconProps) => (
  <svg
    className={size}
    fill={isActive ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={isActive ? 0 : 2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);