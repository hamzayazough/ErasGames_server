'use client';

interface MediaDisplayProps {
  url: string;
  alt?: string;
  className?: string;
}

export function MediaDisplay({ url, alt = '', className = '' }: MediaDisplayProps) {
  return (
    <div className={`relative ${className}`}>
      <img
        src={url}
        alt={alt}
        className="w-full h-auto rounded-lg shadow-md"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="flex items-center justify-center h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <span class="text-gray-500">Failed to load image</span>
              </div>
            `;
          }
        }}
      />
    </div>
  );
}