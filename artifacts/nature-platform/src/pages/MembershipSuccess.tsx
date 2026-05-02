import { useLocation } from "wouter";

export default function MembershipSuccess() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-10 h-10 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="font-serif text-4xl text-stone-900 mb-4">
          Welcome to the family
        </h1>
        <p className="text-stone-600 text-lg mb-2">
          Thank you for becoming a member of The Verdant Page.
        </p>
        <p className="text-stone-500 mb-10">
          A confirmation email is on its way. Your support makes independent
          nature writing possible.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/articles")}
            className="px-8 py-3 bg-emerald-700 text-white font-medium rounded-lg hover:bg-emerald-800 transition-colors"
          >
            Read the latest essays
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-white text-stone-700 font-medium rounded-lg border border-stone-300 hover:bg-stone-50 transition-colors"
          >
            Go to homepage
          </button>
        </div>
      </div>
    </div>
  );
}
