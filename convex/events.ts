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
    confirmationDeadline: v.optional(v.number()),
    requireCheckIn: v.optional(v.boolean()),
    checkInWindowHours: v.optional(v.number()),
    checkInDeadlineMinutes: v.optional(v.number()),
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
    confirmationDeadline: v.optional(v.number()),
    requireCheckIn: v.optional(v.boolean()),
    checkInWindowHours: v.optional(v.number()),
    checkInDeadlineMinutes: v.optional(v.number()),
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

// Obter estatísticas completas do evento
export const getEventStats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Evento não encontrado");
    }

    // Estatísticas de participação
    const confirmations = await ctx.db
      .query("attendanceConfirmations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const confirmed = confirmations.filter((c) => c.status === "vou").length;
    const checkedIn = confirmations.filter((c) => c.checkedIn).length;
    const noShows = confirmations.filter((c) => c.status === "vou" && !c.checkedIn).length;
    
    // Calcular participação efetiva baseada nas enquetes
    const polls = await ctx.db
      .query("polls")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    let effectivelyPresent = 0;
    let effectivelyAbsent = 0;

    if (polls.length > 0) {
      // Para cada confirmação "vou", verificar participação nas enquetes
      const confirmedList = confirmations.filter((c) => c.status === "vou");
      
      for (const conf of confirmedList) {
        let pollsParticipated = 0;

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

        const participationRate = (pollsParticipated / polls.length) * 100;
        
        if (participationRate >= 70) {
          effectivelyPresent++;
        } else {
          effectivelyAbsent++;
        }
      }
    }
    
    const attendanceRate = confirmed > 0 
      ? Math.round((checkedIn / confirmed) * 100) 
      : 0;

    const effectiveAttendanceRate = confirmed > 0 
      ? Math.round((effectivelyPresent / confirmed) * 100)
      : 0;

    const occupancyRate = event.participantLimit 
      ? Math.round((confirmed / event.participantLimit) * 100)
      : 0;

    // Estatísticas de sugestões
    const suggestions = await ctx.db
      .query("suggestions")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const approvedSuggestions = suggestions.filter((s) => s.status === "aprovada");
    const topSuggestions = approvedSuggestions
      .sort((a, b) => b.votesCount - a.votesCount)
      .slice(0, 5);

    const totalVotes = suggestions.reduce((sum, s) => sum + s.votesCount, 0);
    const answeredSuggestions = suggestions.filter((s) => s.isAnswered).length;

    // Estatísticas de enquetes
    const polls = await ctx.db
      .query("polls")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const pollsWithResults = await Promise.all(
      polls.map(async (poll) => {
        const options = await ctx.db
          .query("pollOptions")
          .withIndex("by_poll", (q) => q.eq("pollId", poll._id))
          .collect();

        const sortedOptions = options.sort((a, b) => b.votesCount - a.votesCount);
        const winner = sortedOptions[0];

        return {
          _id: poll._id,
          question: poll.question,
          totalVotes: poll.totalVotes,
          options: sortedOptions,
          winner: winner ? { text: winner.optionText, votes: winner.votesCount } : null,
        };
      })
    );

    // Lista de espera
    const waitlist = await ctx.db
      .query("waitlist")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return {
      event: {
        title: event.title,
        status: event.status,
        limit: event.participantLimit,
        hasCheckIn: event.requireCheckIn || false,
      },
      participation: {
        confirmed,
        maybe: confirmations.filter((c) => c.status === "talvez").length,
        declined: confirmations.filter((c) => c.status === "nao_vou").length,
        checkedIn,
        noShows,
        attendanceRate,
        effectivelyPresent,
        effectivelyAbsent,
        effectiveAttendanceRate,
        occupancyRate,
        total: confirmations.length,
      },
      suggestions: {
        total: suggestions.length,
        approved: approvedSuggestions.length,
        pending: suggestions.filter((s) => s.status === "pendente").length,
        rejected: suggestions.filter((s) => s.status === "rejeitada").length,
        answered: answeredSuggestions,
        totalVotes,
        topSuggestions: topSuggestions.map((s) => ({
          content: s.content,
          votes: s.votesCount,
          authorName: s.authorName,
          isAnonymous: s.isAnonymous,
        })),
      },
      polls: {
        total: polls.length,
        results: pollsWithResults,
      },
      waitlist: {
        total: waitlist.length,
      },
    };
  },
});
