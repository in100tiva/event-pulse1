import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Gerar código único para compartilhamento
function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Criar evento
export const create = mutation({
  args: {
    organizationId: v.id("organizations"),
    title: v.string(),
    description: v.optional(v.string()),
    startDateTime: v.number(),
    isOnline: v.boolean(),
    location: v.optional(v.string()),
    participantLimit: v.optional(v.number()),
    allowAnonymousSuggestions: v.boolean(),
    moderateSuggestions: v.boolean(),
    status: v.union(
      v.literal("rascunho"),
      v.literal("publicado"),
      v.literal("ao_vivo"),
      v.literal("encerrado")
    ),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const shareLinkCode = generateShareCode();

    return await ctx.db.insert("events", {
      ...args,
      shareLinkCode,
    });
  },
});

// Atualizar evento
export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDateTime: v.optional(v.number()),
    isOnline: v.optional(v.boolean()),
    location: v.optional(v.string()),
    participantLimit: v.optional(v.number()),
    allowAnonymousSuggestions: v.optional(v.boolean()),
    moderateSuggestions: v.optional(v.boolean()),
    status: v.optional(
      v.union(
        v.literal("rascunho"),
        v.literal("publicado"),
        v.literal("ao_vivo"),
        v.literal("encerrado")
      )
    ),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Excluir evento
export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    await ctx.db.delete(args.id);
  },
});

// Listar eventos de uma organização
export const getByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const events = await ctx.db
      .query("events")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    // Para cada evento, buscar contagens
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const confirmations = await ctx.db
          .query("attendanceConfirmations")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();

        const suggestions = await ctx.db
          .query("suggestions")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();

        const polls = await ctx.db
          .query("polls")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();

        return {
          ...event,
          rsvps: confirmations.filter((c) => c.status === "vou").length,
          suggestions: suggestions.length,
          polls: polls.length,
        };
      })
    );

    return eventsWithCounts;
  },
});

// Obter evento por código de compartilhamento (público)
export const getByShareCode = query({
  args: { shareLinkCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_share_code", (q) => q.eq("shareLinkCode", args.shareLinkCode))
      .first();
  },
});

// Obter detalhes de um evento específico
export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Atualizar status do evento
export const updateStatus = mutation({
  args: {
    id: v.id("events"),
    status: v.union(
      v.literal("rascunho"),
      v.literal("publicado"),
      v.literal("ao_vivo"),
      v.literal("encerrado")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    await ctx.db.patch(args.id, { status: args.status });
    return args.id;
  },
});
