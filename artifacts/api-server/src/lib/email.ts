import { Resend } from "resend";

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM || "The Verdant Page <hello@theverdantpage.com>";

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured — skipping send to", to);
    return false;
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) { console.error("[email] Resend error:", error); return false; }
    return true;
  } catch (err) {
    console.error("[email] Send failed:", err);
    return false;
  }
}
