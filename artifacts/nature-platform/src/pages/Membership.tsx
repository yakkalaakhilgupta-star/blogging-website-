import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string; interval_count: number } | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  prices: Price[];
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

const PERKS = [
  "Unlimited access to all articles and essays",
  "Full archive of past issues",
  "Monthly member newsletter with behind-the-scenes writing",
  "Early access to new essays before publication",
  "Supporter badge on reader comments",
  "Direct support for independent nature writing",
];

export default function Membership() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [checkEmail, setCheckEmail] = useState("");
  const [checkResult, setCheckResult] = useState<{
    active: boolean;
    currentPeriodEnd?: string;
    customerId?: string;
    error?: string;
  } | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [stripeUnavailable, setStripeUnavailable] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL ?? "/api";

  useState(() => {
    fetch(`${API}/membership/products`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error === "stripe_not_configured") {
          setStripeUnavailable(true);
        } else {
          setProducts(data.products ?? []);
        }
        setProductsLoaded(true);
      })
      .catch(() => {
        setStripeUnavailable(true);
        setProductsLoaded(true);
      });
  });

  async function handleCheckout() {
    if (!selectedPriceId) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API}/membership/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: selectedPriceId, email: email || undefined }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silent
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleCheckStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!checkEmail) return;
    setCheckLoading(true);
    setCheckResult(null);
    try {
      const res = await fetch(
        `${API}/membership/status?email=${encodeURIComponent(checkEmail)}`
      );
      const data = await res.json();
      setCheckResult(data);
    } catch {
      setCheckResult({ active: false, error: "Could not check status" });
    } finally {
      setCheckLoading(false);
    }
  }

  async function handlePortal() {
    if (!checkResult?.customerId) return;
    setPortalLoading(true);
    try {
      const res = await fetch(`${API}/membership/portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: checkResult.customerId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setPortalLoading(false);
    }
  }

  const allPrices = products.flatMap((p) =>
    p.prices.map((pr) => ({ ...pr, productName: p.name }))
  );
  const monthlyPrice = allPrices.find((p) => p.recurring?.interval === "month");
  const yearlyPrice = allPrices.find((p) => p.recurring?.interval === "year");

  return (
    <div className="min-h-screen bg-stone-50">
      <Helmet>
        <title>Membership – The Verdant Page</title>
        <meta name="description" content="Support independent nature writing. Become a member of The Verdant Page and help fund rigorous, lyrical science journalism." />
        <link rel="canonical" href={`${window.location.origin}/membership`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Membership – The Verdant Page" />
        <meta property="og:description" content="Support independent nature writing. Become a member of The Verdant Page and help fund rigorous, lyrical science journalism." />
        <meta property="og:url" content={`${window.location.origin}/membership`} />
        <meta property="og:image" content={`${window.location.origin}/opengraph.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Membership – The Verdant Page" />
        <meta name="twitter:description" content="Support independent nature writing. Become a member of The Verdant Page and help fund rigorous, lyrical science journalism." />
        <meta name="twitter:image" content={`${window.location.origin}/opengraph.jpg`} />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6">
        <header className="text-center mb-16">
          <p className="text-sm font-medium tracking-widest text-emerald-700 uppercase mb-4">
            Support Independent Nature Writing
          </p>
          <h1 className="font-serif text-5xl text-stone-900 mb-6">
            Become a Member
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            The Verdant Page is reader-supported. Your membership funds the
            research, travel, and time that goes into every essay.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {!productsLoaded ? (
            <>
              <div className="h-72 bg-stone-100 rounded-2xl animate-pulse" />
              <div className="h-72 bg-stone-100 rounded-2xl animate-pulse" />
            </>
          ) : stripeUnavailable ? (
            <div className="md:col-span-2 rounded-2xl border-2 border-dashed border-stone-300 p-12 text-center text-stone-500">
              <p className="text-lg font-medium mb-2">Membership coming soon</p>
              <p className="text-sm">
                Payment processing is being set up. Check back shortly.
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="md:col-span-2 rounded-2xl border-2 border-dashed border-stone-300 p-12 text-center text-stone-500">
              <p className="text-lg font-medium mb-2">No plans available yet</p>
              <p className="text-sm">Membership plans are being configured.</p>
            </div>
          ) : (
            <>
              {monthlyPrice && (
                <PlanCard
                  label="Monthly"
                  price={formatPrice(monthlyPrice.unit_amount, monthlyPrice.currency)}
                  interval="per month"
                  priceId={monthlyPrice.id}
                  selected={selectedPriceId === monthlyPrice.id}
                  onSelect={() => setSelectedPriceId(monthlyPrice.id)}
                />
              )}
              {yearlyPrice && (
                <PlanCard
                  label="Annual"
                  price={formatPrice(yearlyPrice.unit_amount, yearlyPrice.currency)}
                  interval="per year"
                  priceId={yearlyPrice.id}
                  selected={selectedPriceId === yearlyPrice.id}
                  onSelect={() => setSelectedPriceId(yearlyPrice.id)}
                  badge="Best value"
                />
              )}
              {!monthlyPrice && !yearlyPrice &&
                allPrices.map((p) => (
                  <PlanCard
                    key={p.id}
                    label={p.productName}
                    price={formatPrice(p.unit_amount, p.currency)}
                    interval={p.recurring ? `per ${p.recurring.interval}` : "one-time"}
                    priceId={p.id}
                    selected={selectedPriceId === p.id}
                    onSelect={() => setSelectedPriceId(p.id)}
                  />
                ))}
            </>
          )}
        </div>

        {!stripeUnavailable && products.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 mb-16">
            <h2 className="font-serif text-2xl text-stone-900 mb-6">
              Complete your membership
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleCheckout}
                disabled={!selectedPriceId || checkoutLoading}
                className="w-full py-3 px-6 bg-emerald-700 text-white font-medium rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {checkoutLoading
                  ? "Redirecting to checkout…"
                  : selectedPriceId
                  ? "Continue to secure checkout →"
                  : "Select a plan above"}
              </button>
              <p className="text-xs text-stone-500 text-center">
                Secure payment via Stripe. Cancel any time.
              </p>
            </div>
          </div>
        )}

        <div className="bg-stone-100 rounded-2xl p-8 mb-16">
          <h2 className="font-serif text-2xl text-stone-900 mb-6">
            What's included
          </h2>
          <ul className="space-y-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <span className="text-emerald-600 mt-0.5 flex-shrink-0">✓</span>
                <span className="text-stone-700">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <h2 className="font-serif text-2xl text-stone-900 mb-2">
            Already a member?
          </h2>
          <p className="text-stone-600 mb-6">
            Check your membership status or manage your subscription.
          </p>
          <form onSubmit={handleCheckStatus} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="email"
                value={checkEmail}
                onChange={(e) => setCheckEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={checkLoading}
                className="px-6 py-3 bg-stone-800 text-white font-medium rounded-lg hover:bg-stone-900 disabled:opacity-50 transition-colors"
              >
                {checkLoading ? "Checking…" : "Check"}
              </button>
            </div>
          </form>

          {checkResult && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                checkResult.active
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-stone-50 border border-stone-200"
              }`}
            >
              {checkResult.active ? (
                <div>
                  <p className="text-emerald-800 font-medium mb-1">
                    ✓ Active membership
                  </p>
                  {checkResult.currentPeriodEnd && (
                    <p className="text-emerald-700 text-sm">
                      Renews{" "}
                      {new Date(checkResult.currentPeriodEnd).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </p>
                  )}
                  {checkResult.customerId && (
                    <button
                      onClick={handlePortal}
                      disabled={portalLoading}
                      className="mt-3 text-sm text-emerald-700 underline hover:text-emerald-800"
                    >
                      {portalLoading ? "Opening…" : "Manage subscription →"}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-stone-600">
                  {checkResult.error
                    ? checkResult.error
                    : "No active membership found for this email."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  label,
  price,
  interval,
  priceId,
  selected,
  onSelect,
  badge,
}: {
  label: string;
  price: string;
  interval: string;
  priceId: string;
  selected: boolean;
  onSelect: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative text-left w-full rounded-2xl p-8 border-2 transition-all ${
        selected
          ? "border-emerald-600 bg-emerald-50 shadow-md"
          : "border-stone-200 bg-white hover:border-stone-300 shadow-sm"
      }`}
    >
      {badge && (
        <span className="absolute top-4 right-4 text-xs font-medium bg-emerald-700 text-white px-2.5 py-1 rounded-full">
          {badge}
        </span>
      )}
      <p className="text-sm font-medium tracking-wide text-stone-500 uppercase mb-3">
        {label}
      </p>
      <p className="font-serif text-4xl text-stone-900 mb-1">{price}</p>
      <p className="text-stone-500 text-sm">{interval}</p>
      <div
        className={`mt-6 w-5 h-5 rounded-full border-2 transition-all ${
          selected ? "border-emerald-600 bg-emerald-600" : "border-stone-300"
        }`}
      />
    </button>
  );
}
