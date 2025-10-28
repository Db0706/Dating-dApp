import { FaUser } from 'react-icons/fa';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  showSilhouette?: boolean;
}

export default function Avatar({
  src,
  alt,
  size = 'md',
  className = '',
  showSilhouette = true
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    full: 'w-full h-full',
  };

  const iconSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
    full: 'text-8xl',
  };

  // If image exists, show it
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} ${className} object-cover`}
        onError={(e) => {
          // If image fails to load, hide it and show placeholder
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // Show silhouette placeholder
  return (
    <div
      className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center`}
    >
      {showSilhouette ? (
        // Person silhouette icon
        <FaUser className={`${iconSizes[size]} text-gray-500`} />
      ) : (
        // First letter fallback
        <span className={`${iconSizes[size]} font-bold text-gray-400`}>
          {alt.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
