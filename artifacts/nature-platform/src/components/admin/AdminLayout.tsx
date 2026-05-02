import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  FileText, Leaf, Briefcase, Tag, BarChart2, Mail, LogOut, Menu, X, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/species", label: "Species", icon: Leaf },
  { href: "/admin/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/admin/tags", label: "Tags & Categories", icon: Tag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

function LoginGate({ onLogin }: { onLogin: (s: string) => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const res = await fetch("/api/contact/messages", {
      headers: { Authorization: `Bearer ${input.trim()}` },
    });
    if (res.ok) {
      onLogin(input.trim());
    } else {
      setError("Invalid admin secret. Check your credentials.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <Lock className="h-5 w-5 text-primary" />
          <h1 className="font-serif text-2xl font-bold">Admin Access</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Admin Secret</label>
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter admin secret..."
              className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { secret, setSecret, clearSecret, isAdmin } = useAdminAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAdmin) return <LoginGate onLogin={setSecret} />;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-foreground text-background shrink-0">
        <div className="px-5 py-6 border-b border-background/10">
          <p className="font-serif font-bold text-lg">Admin</p>
          <p className="text-background/50 text-xs mt-0.5">The Verdant Page</p>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm transition-colors",
                location.startsWith(href)
                  ? "bg-background/15 text-background font-medium"
                  : "text-background/60 hover:text-background hover:bg-background/10"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-2 py-4 border-t border-background/10">
          <button
            onClick={clearSecret}
            className="flex items-center gap-2 px-3 py-2 text-sm text-background/60 hover:text-background w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-foreground text-background px-4 h-14 flex items-center justify-between">
        <p className="font-serif font-bold">Admin</p>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-foreground text-background pt-14">
          <nav className="py-4 space-y-1 px-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-sm text-background/80 hover:text-background">
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
            <button onClick={clearSecret} className="flex items-center gap-3 px-3 py-3 text-sm text-background/60">
              <LogOut className="h-4 w-4" />Sign out
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto md:p-8 p-4 mt-14 md:mt-0">
        {children}
      </main>
    </div>
  );
}
