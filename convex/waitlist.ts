import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Adicionar lead à lista de espera
export const addToWaitlist = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    whatsapp: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Evento não encontrado");
    }

    // Verificar se já está na lista de espera
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    const alreadyInWaitlist = existing.some(
      (w) => w.whatsapp === args.whatsapp || w.name === args.name
    );

    if (alreadyInWaitlist) {
      throw new Error("Você já está na lista de espera deste evento");
    }

    return await ctx.db.insert("waitlist", {
      eventId: args.eventId,
      name: args.name,
      whatsapp: args.whatsapp,
      createdAt: Date.now(),
    });
  },
});

// Buscar leads de um evento específico
export const getByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("waitlist")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .collect();
  },
});

// Buscar todos os leads de uma organização
export const getByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Buscar todos os eventos da organização
    const events = await ctx.db
      .query("events")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Para cada evento, buscar os leads
    const leadsWithEvent = await Promise.all(
      events.map(async (event) => {
        const leads = await ctx.db
          .query("waitlist")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .order("desc")
          .collect();

        return leads.map((lead) => ({
          ...lead,
          eventTitle: event.title,
          eventStartDateTime: event.startDateTime,
        }));
      })
    );

    // Flatten array
    return leadsWithEvent.flat();
  },
});

// Remover lead da lista de espera
export const removeFromWaitlist = mutation({
  args: { id: v.id("waitlist") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    await ctx.db.delete(args.id);
  },
});

// Contar leads de um evento
export const countByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const leads = await ctx.db
      .query("waitlist")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return leads.length;
  },
});

