import { tickets, type Ticket, type InsertTicket } from "@shared/schema";

export interface IStorage {
  createTicket(ticket: InsertTicket): Promise<Ticket>;
}

export class MemStorage implements IStorage {
  private tickets: Map<number, Ticket>;
  private currentId: number;

  constructor() {
    this.tickets = new Map();
    this.currentId = 1;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.currentId++;
    const ticket: Ticket = {
      ...insertTicket,
      id,
      createdAt: new Date(),
    };
    this.tickets.set(id, ticket);
    return ticket;
  }
}

export const storage = new MemStorage();
