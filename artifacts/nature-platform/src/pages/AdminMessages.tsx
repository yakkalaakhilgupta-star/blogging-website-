import { useState, useCallback } from "react";
import { Mail, MailOpen, Trash2, Reply, RefreshCw, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "verdant_admin_secret";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function getAuthHeader(secret: string) {
  return { Authorization: `Bearer ${secret}` };
}

async function fetchMessages(secret: string): Promise<ContactMessage[]> {
  const res = await fetch("/api/contact/messages", {
    headers: getAuthHeader(secret),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

function SecretGate({ onAuth }: { onAuth: (s: string) => void }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      localStorage.setItem(STORAGE_KEY, value.trim());
      onAuth(value.trim());
    }
  };

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-serif text-3xl font-bold mb-2">Admin Access</h2>
        <p className="text-muted-foreground mb-8 text-sm">Enter your admin secret key to continue.</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              placeholder="Admin secret key"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="pr-10 font-mono"
              autoFocus
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShow((s) => !s)}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button type="submit" disabled={!value.trim()}>
            Unlock Inbox
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminMessages() {
  const stored = localStorage.getItem(STORAGE_KEY) ?? "";
  const [secret, setSecret] = useState(stored);
  const [authError, setAuthError] = useState(false);
  const qc = useQueryClient();
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ["admin-messages", secret],
    queryFn: () => fetchMessages(secret),
    enabled: !!secret,
    retry: (count, err) => {
      if ((err as Error).message === "UNAUTHORIZED") { setAuthError(true); return false; }
      return count < 1;
    },
  });

  const markRead = useCallback(async (id: number) => {
    await fetch(`/api/contact/${id}/read`, {
      method: "PATCH",
      headers: getAuthHeader(secret),
    });
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  }, [qc, secret]);

  const deleteMessage = useCallback(async (id: number) => {
    setDeletingId(id);
    try {
      await fetch(`/api/contact/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(secret),
      });
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
    } finally {
      setDeletingId(null);
    }
  }, [qc, secret]);

  const handleAuth = (s: string) => {
    setAuthError(false);
    setSecret(s);
  };

  const handleSignOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSecret("");
    setAuthError(false);
  };

  if (!secret || authError) {
    return <SecretGate onAuth={handleAuth} />;
  }

  const unread = messages?.filter((m) => !m.isRead).length ?? 0;

  const handleSelect = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.isRead) markRead(msg.id);
  };

  return (
    <div className="w-full bg-background pt-12 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-1">Message Inbox</h1>
            <p className="text-muted-foreground">
              {unread > 0 ? (
                <span><Badge className="mr-2 bg-primary">{unread} unread</Badge></span>
              ) : "All messages read "}
              {messages?.length ?? 0} total messages
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <Lock className="h-4 w-4 mr-2" /> Lock
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 border border-border bg-card overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : messages && messages.length > 0 ? (
              <ul>
                {messages.map((msg) => (
                  <li
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${
                      selected?.id === msg.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {msg.isRead ? (
                          <MailOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <Mail className="h-4 w-4 shrink-0 text-primary" />
                        )}
                        <span className={`truncate text-sm ${!msg.isRead ? "font-semibold" : "font-medium"}`}>
                          {msg.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(msg.createdAt), "MMM d")}
                      </span>
                    </div>
                    <p className={`text-sm truncate mt-1 ${!msg.isRead ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No messages yet</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 border border-border bg-card p-6">
            {selected ? (
              <div>
                <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-border">
                  <div>
                    <h2 className="font-serif text-2xl font-bold mb-1">{selected.subject}</h2>
                    <p className="text-sm text-muted-foreground">
                      From <strong>{selected.name}</strong> &lt;{selected.email}&gt; ·{" "}
                      {format(new Date(selected.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                      className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium border border-border hover:bg-muted transition-colors"
                    >
                      <Reply className="h-4 w-4" /> Reply
                    </a>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMessage(selected.id)}
                      disabled={deletingId === selected.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                    {selected.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Mail className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Select a message to read it</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
