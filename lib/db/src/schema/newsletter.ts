import { pgTable, text, serial, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const newsletterSubscribersTable = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("newsletter_email_idx").on(t.email),
  index("newsletter_created_at_idx").on(t.createdAt),
]);

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribersTable).omit({ id: true, createdAt: true });
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribersTable.$inferSelect;
