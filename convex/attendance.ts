import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Criar ou atualizar confirmação de presença
export const confirmAttendance = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    email: v.string(),
    status: v.union(v.literal("vou"), v.literal("talvez"), v.literal("nao_vou")),
  },
  handler: async (ctx, args) => {
    // Buscar o evento
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Evento não encontrado");
    }

    // Verificar se já existe confirmação para este email neste evento
    const existing = await ctx.db
      .query("attendanceConfirmations")
      .withIndex("by_event_email", (q) =>
        q.eq("eventId", args.eventId).eq("email", args.email)
      )
      .first();

    if (existing) {
      // Atualizar status existente (permitido mesmo se evento lotado)
      await ctx.db.patch(existing._id, {
        name: args.name,
        status: args.status,
      });
      return existing._id;
    }

    // Para novas confirmações com status "vou", verificar limite
    if (args.status === "vou" && event.participantLimit) {
      // Contar confirmações com status "vou"
      const confirmations = await ctx.db
        .query("attendanceConfirmations")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect();

      const confirmedCount = confirmations.filter((c) => c.status === "vou").length;

      if (confirmedCount >= event.participantLimit) {
        throw new Error("EVENTO_LOTADO");
      }
    }

    // Criar nova confirmação
    return await ctx.db.insert("attendanceConfirmations", {
      eventId: args.eventId,
      name: args.name,
      email: args.email,
      status: args.status,
      checkedIn: false,
    });
  },
});

// Listar confirmações de um evento
export const getByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attendanceConfirmations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

// Obter estatísticas de confirmação
export const getStats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const confirmations = await ctx.db
      .query("attendanceConfirmations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return {
      confirmed: confirmations.filter((c) => c.status === "vou").length,
      maybe: confirmations.filter((c) => c.status === "talvez").length,
      declined: confirmations.filter((c) => c.status === "nao_vou").length,
      checkedIn: confirmations.filter((c) => c.checkedIn).length,
      total: confirmations.length,
    };
  },
});

// Fazer check-in de um participante
export const checkIn = mutation({
  args: {
    id: v.id("attendanceConfirmations"),
    checkedIn: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    await ctx.db.patch(args.id, {
      checkedIn: args.checkedIn,
    });
  },
});

// Exportar lista de participantes (retorna dados para CSV)
export const exportList = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("attendanceConfirmations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});


