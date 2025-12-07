import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Criar sugestão
export const create = mutation({
  args: {
    eventId: v.id("events"),
    content: v.string(),
    authorName: v.optional(v.string()),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Evento não encontrado");
    }

    // Verificar se evento permite sugestões anônimas
    if (args.isAnonymous && !event.allowAnonymousSuggestions) {
      throw new Error("Sugestões anônimas não são permitidas neste evento");
    }

    const status = event.moderateSuggestions ? "pendente" : "aprovada";

    return await ctx.db.insert("suggestions", {
      eventId: args.eventId,
      content: args.content,
      authorName: args.authorName,
      isAnonymous: args.isAnonymous,
      status,
      isAnswered: false,
      votesCount: 0,
    });
  },
});

// Listar sugestões de um evento
export const getByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("suggestions")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

// Listar sugestões aprovadas ordenadas por votos
export const getApprovedByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const suggestions = await ctx.db
      .query("suggestions")
      .withIndex("by_event_status", (q) => 
        q.eq("eventId", args.eventId).eq("status", "aprovada")
      )
      .collect();

    // Ordenar por número de votos (decrescente)
    return suggestions.sort((a, b) => b.votesCount - a.votesCount);
  },
});

// Atualizar status da sugestão (aprovar/rejeitar)
export const updateStatus = mutation({
  args: {
    id: v.id("suggestions"),
    status: v.union(
      v.literal("pendente"),
      v.literal("aprovada"),
      v.literal("rejeitada")
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

// Marcar sugestão como respondida
export const markAsAnswered = mutation({
  args: {
    id: v.id("suggestions"),
    isAnswered: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    await ctx.db.patch(args.id, { isAnswered: args.isAnswered });
    return args.id;
  },
});

// Votar em uma sugestão
export const vote = mutation({
  args: {
    suggestionId: v.id("suggestions"),
    participantIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    // Verificar se já votou
    const existingVote = await ctx.db
      .query("suggestionVotes")
      .withIndex("by_suggestion_participant", (q) =>
        q
          .eq("suggestionId", args.suggestionId)
          .eq("participantIdentifier", args.participantIdentifier)
      )
      .first();

    if (existingVote) {
      // Remover voto (desvotou)
      await ctx.db.delete(existingVote._id);

      const suggestion = await ctx.db.get(args.suggestionId);
      if (suggestion) {
        await ctx.db.patch(args.suggestionId, {
          votesCount: Math.max(0, suggestion.votesCount - 1),
        });
      }
      return { action: "unvoted" };
    }

    // Adicionar voto
    await ctx.db.insert("suggestionVotes", {
      suggestionId: args.suggestionId,
      participantIdentifier: args.participantIdentifier,
    });

    const suggestion = await ctx.db.get(args.suggestionId);
    if (suggestion) {
      await ctx.db.patch(args.suggestionId, {
        votesCount: suggestion.votesCount + 1,
      });
    }

    return { action: "voted" };
  },
});

// Verificar se usuário já votou
export const hasVoted = query({
  args: {
    suggestionId: v.id("suggestions"),
    participantIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query("suggestionVotes")
      .withIndex("by_suggestion_participant", (q) =>
        q
          .eq("suggestionId", args.suggestionId)
          .eq("participantIdentifier", args.participantIdentifier)
      )
      .first();

    return vote !== null;
  },
});

// Deletar sugestão
export const deleteSuggestion = mutation({
  args: { id: v.id("suggestions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    // Deletar votos associados
    const votes = await ctx.db
      .query("suggestionVotes")
      .withIndex("by_suggestion_participant", (q) =>
        q.eq("suggestionId", args.id)
      )
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    // Deletar sugestão
    await ctx.db.delete(args.id);
  },
});
