import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTicketSchema } from "@shared/schema";
import { ZodError } from "zod";
import fetch from 'node-fetch';

export async function registerRoutes(app: Express) {
  app.post("/api/tickets", async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(ticketData);

      // Create ticket in Intercom using direct API call
      try {
        const intercomResponse = await fetch('https://api.intercom.io/tickets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'Intercom-Version': '2.10',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            ticket_type_id: "External Tickets", 
            contacts: [{ email: ticketData.email }],
            ticket_attributes: {
              _default_title_: ticketData.subject,
              _default_description_: `Client ID: ${ticketData.clientId}\n\n${ticketData.message}`
            }
          }),
        });

        if (!intercomResponse.ok) {
          throw new Error(`Intercom API error: ${await intercomResponse.text()}`);
        }

        const intercomTicket = await intercomResponse.json();

        // Return combined response
        res.status(201).json({
          ...ticket,
          intercomTicketId: intercomTicket.id,
        });
      } catch (intercomError: any) {
        console.error("Intercom API Error:", intercomError);
        // Still return success if local storage worked but Intercom failed
        res.status(201).json({
          ...ticket,
          intercomError: "Failed to create ticket in Intercom",
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Failed to create ticket" });
      }
    }
  });

  return createServer(app);
}