import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  priority: text("priority").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTicketSchema = createInsertSchema(tickets)
  .pick({
    name: true,
    email: true,
    subject: true,
    message: true,
    priority: true,
  })
  .extend({
    email: z.string().email("Please enter a valid email address"),
    message: z.string().min(10, "Message must be at least 10 characters"),
  });

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;
