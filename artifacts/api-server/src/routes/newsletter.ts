import { Router } from "express";
import { db } from "@workspace/db";
import { newsletterSubscribersTable } from "@workspace/db";
import { SubscribeNewsletterBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import validator from "validator";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

router.post("/newsletter", async (req, res) => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { email, name } = parsed.data;

  if (!validator.isEmail(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  const sanitized = {
    email: validator.normalizeEmail(email) || email,
    name: name ? validator.escape(name.trim()) : undefined,
  };

  const [subscriber] = await db
    .insert(newsletterSubscribersTable)
    .values(sanitized)
    .onConflictDoNothing()
    .returning();
  res.status(201).json(subscriber ?? { message: "Already subscribed" });
});

router.get("/newsletter", requireAdmin, async (req, res) => {
  const subscribers = await db
    .select()
    .from(newsletterSubscribersTable)
    .orderBy(newsletterSubscribersTable.createdAt);
  res.json(subscribers);
});

router.post("/newsletter/unsubscribe", async (req, res) => {
  const { email } = req.body;
  if (!email || !validator.isEmail(email)) {
    res.status(400).json({ error: "Valid email required" });
    return;
  }
  const normalized = validator.normalizeEmail(email) || email;
  await db
    .delete(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.email, normalized));
  res.json({ message: "Unsubscribed successfully" });
});

export default router;
