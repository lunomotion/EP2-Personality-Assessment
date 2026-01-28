import Image from 'next/image';

export function ReportHeader() {
  return (
    <header className="mb-6">
      {/* Red accent line at top */}
      <div className="h-1 bg-gradient-to-r from-ep-red via-ep-purple to-ep-blue mb-6 rounded-full" />

      <div className="flex items-center justify-center gap-4">
        <div className="icon-card icon-card-lg">
          <Image
            src="/api/uploads/ep2Logo.png"
            alt="EP2 Logo"
            width={72}
            height={72}
            className="object-contain"
            priority
            unoptimized
          />
        </div>
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            Entrepreneurial Pursuit
          </h1>
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Assessment Report
          </h2>
        </div>
      </div>
    </header>
  );
}
