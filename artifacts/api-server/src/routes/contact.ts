import { Router } from "express";
import { db } from "@workspace/db";
import { contactMessagesTable } from "@workspace/db";
import { SubmitContactBody } from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";
import validator from "validator";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

router.post("/contact", async (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { name, email, subject, message } = parsed.data;

  if (!validator.isEmail(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  const sanitized = {
    name: validator.escape(name.trim()),
    email: validator.normalizeEmail(email) || email,
    subject: validator.escape(subject.trim()),
    message: validator.escape(message.trim()),
  };

  const [msg] = await db.insert(contactMessagesTable).values(sanitized).returning();
  res.status(201).json(msg);
});

router.get("/contact/messages", requireAdmin, async (req, res) => {
  const messages = await db
    .select()
    .from(contactMessagesTable)
    .orderBy(desc(contactMessagesTable.createdAt));
  res.json(messages);
});

router.patch("/contact/:id/read", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [updated] = await db
    .update(contactMessagesTable)
    .set({ isRead: true })
    .where(eq(contactMessagesTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Message not found" }); return; }
  res.json(updated);
});

router.delete("/contact/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(contactMessagesTable).where(eq(contactMessagesTable.id, id));
  res.status(204).send();
});

export default router;
