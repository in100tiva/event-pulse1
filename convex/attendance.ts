import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Função auxiliar para verificar se o evento está lotado
async function isEventFull(
  ctx: any,
  eventId: Id<"events">,
  event: Doc<"events">,
  currentUserEmail: string
): Promise<{ isFull: boolean; confirmedCount: number }> {
  // Se não há limite definido ou é 0, o evento não está lotado
  if (!event.participantLimit || event.participantLimit <= 0) {
    console.log("[isEventFull] Sem limite definido ou limite é 0, evento não está lotado");
    return { isFull: false, confirmedCount: 0 };
  }

  console.log("[isEventFull] Verificando se evento está lotado");
  console.log("[isEventFull] Limite do evento:", event.participantLimit);
  
  // Buscar todas as confirmações do evento
  const confirmations = await ctx.db
    .query("attendanceConfirmations")
    .withIndex("by_event", (q: any) => q.eq("eventId", eventId))
    .collect();

  // Contar apenas confirmações com status "vou"
  const confirmedCount = confirmations.filter((c: any) => c.status === "vou").length;
  
  console.log("[isEventFull] Confirmações 'vou' atuais:", confirmedCount);
  console.log("[isEventFull] Vagas restantes:", event.participantLimit - confirmedCount);

  // Verificar se o usuário atual já tem confirmação com status "vou"
  const currentUserConfirmation = confirmations.find(
    (c: any) => c.email === currentUserEmail && c.status === "vou"
  );

  if (currentUserConfirmation) {
    console.log("[isEventFull] Usuário já tem confirmação 'vou', não conta como nova vaga");
    return { isFull: false, confirmedCount };
  }

  // Verificar se atingiu o limite
  const isFull = confirmedCount >= event.participantLimit;
  console.log("[isEventFull] Evento está lotado?", isFull);

  return { isFull, confirmedCount };
}

// Criar ou atualizar confirmação de presença
export const confirmAttendance = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    email: v.string(),
    status: v.union(v.literal("vou"), v.literal("talvez"), v.literal("nao_vou")),
  },
  handler: async (ctx, args) => {
    console.log("=".repeat(80));
    console.log("[confirmAttendance] INICIANDO CONFIRMAÇÃO DE PRESENÇA");
    console.log("[confirmAttendance] Nome:", args.name);
    console.log("[confirmAttendance] Email:", args.email);
    console.log("[confirmAttendance] Status desejado:", args.status);
    console.log("=".repeat(80));
    
    // 1. Buscar o evento
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      console.error("[confirmAttendance] ❌ Evento não encontrado:", args.eventId);
      throw new ConvexError("Evento não encontrado");
    }

    console.log("[confirmAttendance] ✓ Evento encontrado:", event.title);
    console.log("[confirmAttendance] Limite de participantes:", event.participantLimit || "Sem limite");

    // 2. Verificar se já existe confirmação para este email
    const existing = await ctx.db
      .query("attendanceConfirmations")
      .withIndex("by_event_email", (q) =>
        q.eq("eventId", args.eventId).eq("email", args.email)
      )
      .first();

    console.log("[confirmAttendance] Confirmação existente?", existing ? "Sim" : "Não");
    if (existing) {
      console.log("[confirmAttendance] Status atual:", existing.status);
    }

    // 3. VERIFICAR LIMITE ANTES DE QUALQUER OPERAÇÃO (apenas para status "vou")
    if (args.status === "vou") {
      console.log("[confirmAttendance] Status desejado é 'vou', verificando disponibilidade...");
      
      // Verificar se o evento está lotado
      const { isFull, confirmedCount } = await isEventFull(
        ctx,
        args.eventId,
        event,
        args.email
      );

      if (isFull) {
        console.error("[confirmAttendance] ❌ EVENTO LOTADO!");
        console.error("[confirmAttendance] Confirmados:", confirmedCount);
        console.error("[confirmAttendance] Limite:", event.participantLimit);
        console.log("=".repeat(80));
        throw new ConvexError("EVENTO_LOTADO");
      }

      console.log("[confirmAttendance] ✓ Evento tem vagas disponíveis");
    }

    // 4. Atualizar ou criar confirmação
    if (existing) {
      console.log("[confirmAttendance] Atualizando confirmação existente...");
      console.log("[confirmAttendance] Mudança de status:", existing.status, "→", args.status);
      
      await ctx.db.patch(existing._id, {
        name: args.name,
        status: args.status,
      });
      
      console.log("[confirmAttendance] ✓ Status atualizado com sucesso!");
      console.log("=".repeat(80));
      return existing._id;
    } else {
      console.log("[confirmAttendance] Criando nova confirmação...");
      
      const newId = await ctx.db.insert("attendanceConfirmations", {
        eventId: args.eventId,
        name: args.name,
        email: args.email,
        status: args.status,
        checkedIn: false,
      });
      
      console.log("[confirmAttendance] ✓ Nova confirmação criada com sucesso!");
      console.log("[confirmAttendance] ID:", newId);
      console.log("=".repeat(80));
      return newId;
    }
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


