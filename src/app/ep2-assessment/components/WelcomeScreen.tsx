'use client';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex items-center justify-center px-6">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left side - Text content */}
        <div className="flex-1 text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            What&apos;s your Entrepreneur
            <br />
            Personality Type?
          </h1>
          <p className="text-white/70 text-lg mb-8">
            Find out exactly what you were born to do.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={onStart}
              className="bg-black text-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors"
            >
              Let&apos;s Go
            </button>
            <span className="text-white/50 text-sm">
              press <span className="font-semibold">Enter</span> ↵
            </span>
          </div>
        </div>

        {/* Right side - EP² Logo */}
        <div className="flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-2xl">
            <img
              src="/icons/ep2Logo.png"
              alt="EP² - Entrepreneur Personality"
              className="w-48 h-48 md:w-64 md:h-64 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
