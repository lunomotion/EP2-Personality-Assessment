import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen ep-gradient flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-lg overflow-hidden">
          <Image
            src="/icons/ep2Logo.png"
            alt="EP2 Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>

        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
          Entrepreneurial Pursuit
        </h1>
        <h2 className="font-serif text-xl text-gray-700 mb-6">
          Assessment Report
        </h2>

        <p className="text-gray-600 mb-8">
          Discover your entrepreneur personality type and find the business opportunity
          that best fits your unique strengths and motivations.
        </p>

        <div className="space-y-4">
          <Link
            href="/report?email=demo@example.com"
            className="block w-full py-3 px-6 bg-ep-purple text-white font-semibold rounded-lg hover:bg-ep-blue transition-colors"
          >
            View Demo Report
          </Link>

          <p className="text-sm text-gray-500">
            Complete the EP2 Assessment to receive your personalized report link.
          </p>
        </div>
      </div>
    </div>
  );
}
