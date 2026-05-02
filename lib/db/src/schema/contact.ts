import { pgTable, text, serial, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contactMessagesTable = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("contact_messages_created_at_idx").on(t.createdAt),
  index("contact_messages_is_read_idx").on(t.isRead),
]);

export const insertContactMessageSchema = createInsertSchema(contactMessagesTable).omit({ id: true, createdAt: true, isRead: true });
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessagesTable.$inferSelect;
