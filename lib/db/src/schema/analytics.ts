import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";

export const pageViewsTable = pgTable("page_views", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("page_views_path_idx").on(table.path),
  index("page_views_created_at_idx").on(table.createdAt),
]);
