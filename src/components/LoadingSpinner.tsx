export function LoadingSpinner() {
  return (
    <div className="min-h-screen ep-gradient flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 border-4 border-ep-purple border-t-transparent rounded-full loading-spinner mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Loading Your Report
        </h2>
        <p className="text-gray-600">
          Please wait while we prepare your personalized assessment...
        </p>
      </div>
    </div>
  );
}
