import Image from 'next/image';

interface IconCardProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  borderColor?: 'purple' | 'pink' | 'orange' | 'cyan' | 'green' | 'black';
  className?: string;
  noBorder?: boolean;
  noPadding?: boolean;
}

const sizeConfig = {
  sm: { className: 'icon-card-sm', pixels: 56 },
  md: { className: 'icon-card-md', pixels: 64 },
  lg: { className: 'icon-card-lg', pixels: 80 },
};

const borderColors = {
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  cyan: '#06B6D4',
  green: '#10B981',
  black: '#333333',
};

export function IconCard({ src, alt, size = 'md', borderColor = 'black', className = '', noBorder = false, noPadding = false }: IconCardProps) {
  const config = sizeConfig[size];

  return (
    <div
      className={`icon-card ${config.className} ${className}`}
      style={noBorder ? { border: 'none' } : { borderColor: borderColors[borderColor] }}
    >
      <Image
        src={src}
        alt={alt}
        width={config.pixels}
        height={config.pixels}
        className={`object-contain ${noPadding ? '' : 'p-1'}`}
        priority
        unoptimized
      />
    </div>
  );
}
