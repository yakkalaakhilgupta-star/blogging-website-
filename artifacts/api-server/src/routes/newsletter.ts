import { Router } from "express";
import { db } from "@workspace/db";
import { newsletterSubscribersTable } from "@workspace/db";
import { SubscribeNewsletterBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { pool } from "@workspace/db";
import validator from "validator";
import { requireAdmin } from "../middlewares/adminAuth";
import { sendEmail } from "../lib/email";
import { welcomeEmail, unsubscribeEmail, broadcastEmail } from "../lib/emailTemplates";
import crypto from "crypto";

const router = Router();
const SITE_URL = process.env.SITE_URL || "https://theverdantpage.com";

router.post("/newsletter", async (req, res) => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  const { email, name } = parsed.data;
  if (!validator.isEmail(email)) { res.status(400).json({ error: "Invalid email address" }); return; }

  const sanitized = {
    email: validator.normalizeEmail(email) || email,
    name: name ? validator.escape(name.trim()) : undefined,
  };

  const confirmToken = crypto.randomBytes(32).toString("hex");

  try {
    // Use raw SQL since confirmed/confirm_token may not be in the drizzle schema
    const existing = await pool.query(
      "SELECT id, confirmed FROM newsletter_subscribers WHERE email = $1",
      [sanitized.email]
    );

    if (existing.rows.length > 0) {
      res.status(200).json({ message: "Already subscribed" });
      return;
    }

    await pool.query(
      "INSERT INTO newsletter_subscribers (email, name, confirmed, confirm_token) VALUES ($1, $2, false, $3)",
      [sanitized.email, sanitized.name ?? null, confirmToken]
    );

    const confirmUrl = `${SITE_URL}/newsletter/confirmed?token=${confirmToken}`;
    await sendEmail(
      sanitized.email,
      "Confirm your subscription — The Verdant Page",
      welcomeEmail(sanitized.name, confirmUrl)
    );

    res.status(201).json({ message: "Please check your email to confirm your subscription." });
  } catch (err) {
    console.error("[newsletter] Subscribe error:", err);
    res.status(500).json({ error: "Subscription failed" });
  }
});

router.get("/newsletter/confirm", async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Token required" });
    return;
  }
  try {
    const result = await pool.query(
      "UPDATE newsletter_subscribers SET confirmed = true, confirm_token = NULL WHERE confirm_token = $1 AND confirmed = false RETURNING id, email, name",
      [token]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Invalid or expired token" });
      return;
    }
    res.json({ message: "Subscription confirmed", email: result.rows[0].email });
  } catch (err) {
    console.error("[newsletter] Confirm error:", err);
    res.status(500).json({ error: "Confirmation failed" });
  }
});

router.get("/newsletter", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, confirmed, created_at FROM newsletter_subscribers ORDER BY created_at DESC"
    );
    res.json(result.rows.map((r) => ({
      id: r.id, email: r.email, name: r.name,
      confirmed: r.confirmed, createdAt: r.created_at,
    })));
  } catch {
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

router.post("/newsletter/unsubscribe", async (req, res) => {
  const { email } = req.body;
  if (!email || !validator.isEmail(email)) { res.status(400).json({ error: "Valid email required" }); return; }
  const normalized = validator.normalizeEmail(email) || email;
  try {
    await pool.query("DELETE FROM newsletter_subscribers WHERE email = $1", [normalized]);
    await sendEmail(normalized, "You've been unsubscribed — The Verdant Page", unsubscribeEmail());
    res.json({ message: "Unsubscribed successfully" });
  } catch {
    res.status(500).json({ error: "Unsubscribe failed" });
  }
});

router.post("/newsletter/broadcast", requireAdmin, async (req, res) => {
  const { subject, body } = req.body;
  if (!subject || !body) { res.status(400).json({ error: "subject and body required" }); return; }

  try {
    const result = await pool.query(
      "SELECT id, email, name FROM newsletter_subscribers WHERE confirmed = true"
    );
    const subscribers = result.rows;

    let sent = 0;
    let failed = 0;
    for (const sub of subscribers) {
      const unsubToken = Buffer.from(sub.email).toString("base64");
      const html = broadcastEmail(subject, body.replace(/\n/g, "<br/>"), unsubToken);
      const ok = await sendEmail(sub.email, subject, html);
      if (ok) sent++; else failed++;
    }

    res.json({
      message: "Broadcast complete",
      sent,
      failed,
      skipped: 0,
    });
  } catch (err) {
    console.error("[newsletter] Broadcast error:", err);
    res.status(500).json({ error: "Broadcast failed" });
  }
});

export default router;
