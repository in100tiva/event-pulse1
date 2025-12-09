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
    console.log("[confirmAttendance] Iniciando confirmação de presença");
    console.log("[confirmAttendance] Email:", args.email);
    console.log("[confirmAttendance] Status:", args.status);
    
    // Buscar o evento
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      console.error("[confirmAttendance] Evento não encontrado:", args.eventId);
      throw new Error("Evento não encontrado");
    }

    console.log("[confirmAttendance] Evento:", event.title);
    console.log("[confirmAttendance] Limite de participantes:", event.participantLimit);

    // Verificar se já existe confirmação para este email neste evento
    const existing = await ctx.db
      .query("attendanceConfirmations")
      .withIndex("by_event_email", (q) =>
        q.eq("eventId", args.eventId).eq("email", args.email)
      )
      .first();

    if (existing) {
      console.log("[confirmAttendance] Confirmação já existe, atualizando status");
      console.log("[confirmAttendance] Status anterior:", existing.status, "→ Status novo:", args.status);
      
      // Se estava com outro status e agora quer confirmar "vou", verificar limite
      if (existing.status !== "vou" && args.status === "vou" && event.participantLimit) {
        // Contar confirmações atuais com status "vou"
        const confirmations = await ctx.db
          .query("attendanceConfirmations")
          .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
          .collect();

        const confirmedCount = confirmations.filter((c) => c.status === "vou").length;
        
        console.log("[confirmAttendance] Confirmados atuais:", confirmedCount);
        console.log("[confirmAttendance] Limite:", event.participantLimit);

        if (confirmedCount >= event.participantLimit) {
          console.log("[confirmAttendance] EVENTO LOTADO! Bloqueando confirmação");
          throw new Error("EVENTO_LOTADO");
        }
      }
      
      // Atualizar status existente
      await ctx.db.patch(existing._id, {
        name: args.name,
        status: args.status,
      });
      console.log("[confirmAttendance] Status atualizado com sucesso");
      return existing._id;
    }

    // Para novas confirmações com status "vou", verificar limite
    if (args.status === "vou" && event.participantLimit) {
      console.log("[confirmAttendance] Nova confirmação, verificando limite...");
      
      // Contar confirmações com status "vou"
      const confirmations = await ctx.db
        .query("attendanceConfirmations")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect();

      const confirmedCount = confirmations.filter((c) => c.status === "vou").length;
      
      console.log("[confirmAttendance] Confirmados atuais:", confirmedCount);
      console.log("[confirmAttendance] Limite:", event.participantLimit);
      console.log("[confirmAttendance] Pode confirmar?", confirmedCount < event.participantLimit);

      if (confirmedCount >= event.participantLimit) {
        console.log("[confirmAttendance] EVENTO LOTADO! Bloqueando nova confirmação");
        throw new Error("EVENTO_LOTADO");
      }
    }

    // Criar nova confirmação
    console.log("[confirmAttendance] Criando nova confirmação...");
    const newId = await ctx.db.insert("attendanceConfirmations", {
      eventId: args.eventId,
      name: args.name,
      email: args.email,
      status: args.status,
      checkedIn: false,
    });
    console.log("[confirmAttendance] Confirmação criada com sucesso:", newId);
    return newId;
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


