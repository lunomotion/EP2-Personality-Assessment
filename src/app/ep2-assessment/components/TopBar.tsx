'use client';

interface TopBarProps {
  sectionNumber: number;
  sectionTitle: string;
}

export default function TopBar({ sectionNumber, sectionTitle }: TopBarProps) {
  return (
    <div className="fixed top-1 left-0 right-0 z-40 px-6 py-3">
      <div className="flex items-center gap-2 text-white/90">
        <span className="font-bold text-sm">{sectionNumber}</span>
        <span className="text-white/50">&rarr;</span>
        <span className="text-sm font-medium">{sectionTitle}</span>
      </div>
    </div>
  );
}
