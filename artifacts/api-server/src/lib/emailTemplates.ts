const BASE = process.env.SITE_URL || "https://theverdantpage.com";

function wrap(body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#f5f4ef;font-family:Georgia,serif;color:#1a1a1a}
.w{max-width:600px;margin:0 auto;padding:32px 16px}
.card{background:#fff;border-radius:2px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.hdr{background:#2d5016;padding:28px 36px}
.hdr h1{color:#fff;font-size:20px;letter-spacing:.03em;margin-bottom:4px}
.hdr p{color:rgba(255,255,255,.65);font-size:12px;font-family:-apple-system,sans-serif}
.body{padding:36px}
.body p{font-size:16px;line-height:1.75;color:#374151;margin-bottom:14px}
.btn{display:inline-block;background:#2d5016;color:#fff !important;text-decoration:none;padding:13px 26px;font-family:-apple-system,sans-serif;font-size:14px;font-weight:600;border-radius:2px;margin:8px 0 18px}
.foot{padding:20px 36px;border-top:1px solid #e5e7eb}
.foot p{color:#9ca3af;font-size:11px;font-family:-apple-system,sans-serif;line-height:1.6}
.foot a{color:#6b7280}
</style></head><body><div class="w"><div class="card">
<div class="hdr"><h1>🌿 The Verdant Page</h1><p>Science &amp; storytelling from the natural world</p></div>
<div class="body">${body}</div>
<div class="foot"><p>The Verdant Page — nature writing at the intersection of science and story.<br/>
<a href="${BASE}">Visit the site</a> &nbsp;·&nbsp; <a href="${BASE}/unsubscribe">Unsubscribe</a></p></div>
</div></div></body></html>`;
}

export function welcomeEmail(name: string | null | undefined, confirmUrl: string): string {
  const hi = name ? `Hello ${name},` : "Hello,";
  return wrap(`<p>${hi}</p>
<p>Thank you for subscribing to <strong>The Verdant Page</strong>. Please confirm your email address to start receiving essays from the natural world.</p>
<a href="${confirmUrl}" class="btn">Confirm My Subscription</a>
<p style="font-size:13px;color:#9ca3af">If you didn't sign up, you can safely ignore this email.</p>`);
}

export function unsubscribeEmail(): string {
  return wrap(`<p>Hello,</p>
<p>You have been successfully unsubscribed from <strong>The Verdant Page</strong>. We're sorry to see you go.</p>
<p>If you change your mind, you're always welcome to <a href="${BASE}/newsletter" style="color:#2d5016">subscribe again</a>.</p>`);
}

export function confirmedEmail(name: string | null | undefined): string {
  const hi = name ? `Hello ${name},` : "Hello,";
  return wrap(`<p>${hi}</p>
<p>You're now confirmed and officially part of <strong>The Verdant Page</strong> community. Welcome!</p>
<p>Expect thoughtful essays at the intersection of science and story — delivered straight to your inbox.</p>
<a href="${BASE}" class="btn">Read the latest</a>
<p style="font-size:13px;color:#9ca3af">Thank you for joining us.</p>`);
}

export function broadcastEmail(subject: string, bodyHtml: string, unsubToken: string): string {
  const unsub = `${BASE}/unsubscribe?token=${unsubToken}`;
  return wrap(`${bodyHtml}
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
<p style="font-size:12px;color:#9ca3af">You're receiving this because you subscribed to The Verdant Page.<br/>
<a href="${unsub}" style="color:#6b7280">Unsubscribe</a></p>`);
}
