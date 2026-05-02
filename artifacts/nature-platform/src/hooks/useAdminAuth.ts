import { useState } from "react";

const KEY = "verdant_admin_secret";

export function useAdminAuth() {
  const [secret, setSecretState] = useState<string>(() => localStorage.getItem(KEY) ?? "");

  function setSecret(s: string) {
    localStorage.setItem(KEY, s);
    setSecretState(s);
  }

  function clearSecret() {
    localStorage.removeItem(KEY);
    setSecretState("");
  }

  const headers: Record<string, string> = secret
    ? { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  return { secret, setSecret, clearSecret, headers, isAdmin: !!secret };
}
