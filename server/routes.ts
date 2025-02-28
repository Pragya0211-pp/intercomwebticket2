import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTicketSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express) {
  app.post("/api/tickets", async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(ticketData);

      // In production, you would make an API call to Intercom here
      // using their Node.js client library

      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to create ticket" });
      }
    }
  });

  return createServer(app);
}
