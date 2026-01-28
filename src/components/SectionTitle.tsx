interface SectionTitleProps {
  children: React.ReactNode;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="font-serif text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-ep-red">
      {children}
    </h2>
  );
}
