import { useLocation } from "wouter";

export default function MembershipCancel() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-10 h-10 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="font-serif text-4xl text-stone-900 mb-4">
          No worries
        </h1>
        <p className="text-stone-600 text-lg mb-2">
          You've cancelled checkout — no charge has been made.
        </p>
        <p className="text-stone-500 mb-10">
          If you'd like to support the work, the membership page will be here
          whenever you're ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/membership")}
            className="px-8 py-3 bg-emerald-700 text-white font-medium rounded-lg hover:bg-emerald-800 transition-colors"
          >
            Back to membership
          </button>
          <button
            onClick={() => navigate("/articles")}
            className="px-8 py-3 bg-white text-stone-700 font-medium rounded-lg border border-stone-300 hover:bg-stone-50 transition-colors"
          >
            Read the essays
          </button>
        </div>
      </div>
    </div>
  );
}
