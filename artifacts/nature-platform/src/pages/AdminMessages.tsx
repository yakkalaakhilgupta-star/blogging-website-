import { useState, useCallback } from "react";
import { Mail, MailOpen, Trash2, Reply, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

async function fetchMessages(): Promise<ContactMessage[]> {
  const res = await fetch("/api/contact/messages");
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export default function AdminMessages() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: fetchMessages,
  });

  const markRead = useCallback(async (id: number) => {
    await fetch(`/api/contact/${id}/read`, { method: "PATCH" });
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  }, [qc]);

  const deleteMessage = useCallback(async (id: number) => {
    setDeletingId(id);
    try {
      await fetch(`/api/contact/${id}`, { method: "DELETE" });
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
    } finally {
      setDeletingId(null);
    }
  }, [qc]);

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
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
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
