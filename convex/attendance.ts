import { v, ConvexError } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
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

    // 2. Verificar prazo de confirmação
    if (event.confirmationDeadline && Date.now() > event.confirmationDeadline) {
      console.error("[confirmAttendance] ❌ Prazo de confirmação encerrado");
      console.error("[confirmAttendance] Prazo era:", new Date(event.confirmationDeadline).toLocaleString('pt-BR'));
      console.error("[confirmAttendance] Agora é:", new Date().toLocaleString('pt-BR'));
      throw new ConvexError({
        message: "PRAZO_ENCERRADO",
        code: "PRAZO_ENCERRADO"
      });
    }

    // 3. Verificar se já existe confirmação para este email
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

    // 4. VERIFICAR LIMITE ANTES DE QUALQUER OPERAÇÃO (apenas para status "vou")
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
        throw new ConvexError({
          message: "EVENTO_LOTADO",
          code: "EVENTO_LOTADO"
        });
      }

      console.log("[confirmAttendance] ✓ Evento tem vagas disponíveis");
    }

    // 5. Atualizar ou criar confirmação
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

// Verificar se usuário confirmou presença (status "vou")
export const hasConfirmedAttendance = query({
  args: { 
    eventId: v.id("events"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const confirmation = await ctx.db
      .query("attendanceConfirmations")
      .withIndex("by_event_email", (q) =>
        q.eq("eventId", args.eventId).eq("email", args.email)
      )
      .first();

    // Retorna true apenas se existe confirmação com status "vou"
    return confirmation?.status === "vou";
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

// Calcular participação efetiva baseada nas enquetes (70% de participação)
export const getEffectiveAttendance = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    // Buscar todas as confirmações
    const confirmations = await ctx.db
      .query("attendanceConfirmations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Buscar todas as enquetes do evento
    const polls = await ctx.db
      .query("polls")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    if (polls.length === 0) {
      // Se não há enquetes, usar check-in manual
      return confirmations.map((conf) => ({
        ...conf,
        effectivelyAttended: conf.checkedIn,
        pollParticipationRate: 0,
        pollsParticipated: 0,
        totalPolls: 0,
      }));
    }

    // Para cada confirmação, calcular participação nas enquetes
    const confirmationsWithAttendance = await Promise.all(
      confirmations.map(async (conf) => {
        let pollsParticipated = 0;

        // Verificar em quantas enquetes a pessoa votou
        for (const poll of polls) {
          const vote = await ctx.db
            .query("pollVotes")
            .withIndex("by_poll_participant", (q) =>
              q.eq("pollId", poll._id).eq("participantIdentifier", conf.email)
            )
            .first();

          if (vote) {
            pollsParticipated++;
          }
        }

        const participationRate = polls.length > 0 
          ? (pollsParticipated / polls.length) * 100 
          : 0;

        // Considera presente efetivamente se participou de 70% ou mais das enquetes
        const effectivelyAttended = participationRate >= 70;

        return {
          ...conf,
          effectivelyAttended,
          pollParticipationRate: Math.round(participationRate),
          pollsParticipated,
          totalPolls: polls.length,
        };
      })
    );

    return confirmationsWithAttendance;
  },
});

// Verificar status do check-in (se está aberto, fechado, etc)
export const getCheckInStatus = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || !event.requireCheckIn || event.requireCheckIn === false) {
      return { enabled: false };
    }

    const now = Date.now();
    const eventStart = event.startDateTime;
    
    // Calcular quando check-in abre e fecha
    const windowHours = event.checkInWindowHours || 4;
    const deadlineMinutes = event.checkInDeadlineMinutes || 30;
    
    const checkInOpens = eventStart - (windowHours * 60 * 60 * 1000);
    const checkInCloses = eventStart - (deadlineMinutes * 60 * 1000);

    const isOpen = now >= checkInOpens && now < checkInCloses;
    const hasPassed = now >= checkInCloses;

    return {
      enabled: true,
      isOpen,
      hasPassed,
      opensAt: checkInOpens,
      closesAt: checkInCloses,
      timeUntilOpen: isOpen ? 0 : Math.max(0, checkInOpens - now),
      timeUntilClose: isOpen ? Math.max(0, checkInCloses - now) : 0,
    };
  },
});

// Check-in público (participante faz check-in na página do evento)
export const publicCheckIn = mutation({
  args: {
    eventId: v.id("events"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Buscar evento
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Evento não encontrado");
    
    // 2. Verificar se check-in está habilitado
    if (!event.requireCheckIn || event.requireCheckIn === false) {
      throw new Error("Check-in não é necessário para este evento");
    }

    // 3. Verificar se está no período de check-in
    const now = Date.now();
    const windowHours = event.checkInWindowHours || 4;
    const deadlineMinutes = event.checkInDeadlineMinutes || 30;
    
    const checkInOpens = event.startDateTime - (windowHours * 60 * 60 * 1000);
    const checkInCloses = event.startDateTime - (deadlineMinutes * 60 * 1000);

    const isOpen = now >= checkInOpens && now < checkInCloses;
    const hasPassed = now >= checkInCloses;
    
    if (!isOpen) {
      throw new ConvexError({
        message: hasPassed ? "CHECKIN_ENCERRADO" : "CHECKIN_NAO_ABERTO",
        code: hasPassed ? "CHECKIN_ENCERRADO" : "CHECKIN_NAO_ABERTO"
      });
    }

    // 4. Buscar confirmação de presença
    const confirmation = await ctx.db
      .query("attendanceConfirmations")
      .withIndex("by_event_email", (q) =>
        q.eq("eventId", args.eventId).eq("email", args.email)
      )
      .first();

    if (!confirmation || confirmation.status !== "vou") {
      throw new Error("Você precisa confirmar presença antes de fazer check-in");
    }

    // 5. Fazer check-in
    await ctx.db.patch(confirmation._id, {
      checkedIn: true,
      checkInTime: Date.now(),
      noShow: false,
    });

    return { success: true };
  },
});

// Liberar vagas automaticamente (scheduled function)
export const releaseNoShowSlots = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    
    // Buscar eventos com check-in obrigatório
    const events = await ctx.db.query("events").collect();
    const eventsWithCheckIn = events.filter(e => e.requireCheckIn === true);

    for (const event of eventsWithCheckIn) {
      // Verificar se deadline de check-in passou
      const deadlineMinutes = event.checkInDeadlineMinutes || 30;
      const checkInDeadline = event.startDateTime - (deadlineMinutes * 60 * 1000);
      
      if (now < checkInDeadline) continue; // Check-in ainda aberto
      if (event.status === "encerrado") continue; // Evento já acabou

      // Buscar confirmados que NÃO fizeram check-in
      const confirmations = await ctx.db
        .query("attendanceConfirmations")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      const noShows = confirmations.filter(
        c => c.status === "vou" && !c.checkedIn
      );

      // Marcar como no-show e mudar status para "nao_vou"
      for (const noShow of noShows) {
        await ctx.db.patch(noShow._id, {
          status: "nao_vou",
          noShow: true,
        });
      }

      if (noShows.length > 0) {
        console.log(`[releaseNoShowSlots] Liberadas ${noShows.length} vagas do evento: ${event.title}`);
      }
    }
  },
});

// Liberar vagas manualmente (botão no dashboard)
export const manualReleaseNoShowSlots = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Evento não encontrado");

    // Buscar confirmados que NÃO fizeram check-in
    const confirmations = await ctx.db
      .query("attendanceConfirmations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const noShows = confirmations.filter(
      c => c.status === "vou" && !c.checkedIn
    );

    for (const noShow of noShows) {
      await ctx.db.patch(noShow._id, {
        status: "nao_vou",
        noShow: true,
      });
    }

    return { releasedCount: noShows.length };
  },
});


