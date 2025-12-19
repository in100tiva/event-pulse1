import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Criar enquete
export const create = mutation({
  args: {
    eventId: v.id("events"),
    question: v.string(),
    options: v.array(v.string()),
    allowMultipleChoice: v.boolean(),
    showResultsAutomatically: v.boolean(),
    timerDuration: v.optional(v.number()), // 30, 60, 90 ou 120 segundos
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Evento não encontrado");
    }

    // Criar a enquete
    const pollId = await ctx.db.insert("polls", {
      eventId: args.eventId,
      question: args.question,
      allowMultipleChoice: args.allowMultipleChoice,
      showResultsAutomatically: args.showResultsAutomatically,
      isActive: false,
      totalVotes: 0,
      timerDuration: args.timerDuration,
    });

    // Criar as opções
    for (const optionText of args.options) {
      await ctx.db.insert("pollOptions", {
        pollId,
        optionText,
        votesCount: 0,
      });
    }

    return pollId;
  },
});

// Listar enquetes de um evento
export const getByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const polls = await ctx.db
      .query("polls")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Para cada enquete, buscar as opções
    const pollsWithOptions = await Promise.all(
      polls.map(async (poll) => {
        const options = await ctx.db
          .query("pollOptions")
          .withIndex("by_poll", (q) => q.eq("pollId", poll._id))
          .collect();

        return {
          ...poll,
          options,
        };
      })
    );

    return pollsWithOptions;
  },
});

// Obter enquete ativa de um evento
export const getActivePoll = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const poll = await ctx.db
      .query("polls")
      .withIndex("by_event_active", (q) =>
        q.eq("eventId", args.eventId).eq("isActive", true)
      )
      .first();

    if (!poll) {
      return null;
    }

    // Buscar opções
    const options = await ctx.db
      .query("pollOptions")
      .withIndex("by_poll", (q) => q.eq("pollId", poll._id))
      .collect();

    return {
      ...poll,
      options,
    };
  },
});

// Ativar/desativar enquete
export const toggleActive = mutation({
  args: {
    id: v.id("polls"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const poll = await ctx.db.get(args.id);
    if (!poll) {
      throw new Error("Enquete não encontrada");
    }

    // Se ativando esta enquete, desativar outras do mesmo evento
    if (args.isActive) {
      const activePolls = await ctx.db
        .query("polls")
        .withIndex("by_event_active", (q) =>
          q.eq("eventId", poll.eventId).eq("isActive", true)
        )
        .collect();

      for (const activePoll of activePolls) {
        await ctx.db.patch(activePoll._id, { isActive: false });
      }

      // Definir timestamps se houver temporizador
      const now = Date.now();
      const updateData: any = { isActive: args.isActive, activatedAt: now };
      
      if (poll.timerDuration) {
        updateData.expiresAt = now + (poll.timerDuration * 1000);
      }
      
      await ctx.db.patch(args.id, updateData);
    } else {
      // Ao desativar, limpar timestamps
      await ctx.db.patch(args.id, { 
        isActive: args.isActive,
        activatedAt: undefined,
        expiresAt: undefined,
      });
    }

    return args.id;
  },
});

// Votar em uma enquete
export const vote = mutation({
  args: {
    pollId: v.id("polls"),
    pollOptionId: v.id("pollOptions"),
    participantIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.pollId);
    if (!poll) {
      throw new Error("Enquete não encontrada");
    }

    if (!poll.isActive) {
      throw new Error("Enquete não está ativa");
    }

    const option = await ctx.db.get(args.pollOptionId);
    if (!option) {
      throw new Error("Opção não encontrada");
    }

    // Verificar se já votou
    const existingVotes = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll_participant", (q) =>
        q
          .eq("pollId", args.pollId)
          .eq("participantIdentifier", args.participantIdentifier)
      )
      .collect();

    // Verificar se já votou nesta opção específica PRIMEIRO
    const existingVoteForOption = existingVotes.find(
      (v) => v.pollOptionId === args.pollOptionId
    );

    // Se clicou na mesma opção que já tinha votado, remover o voto (toggle off)
    if (existingVoteForOption) {
      // Se já votou nesta opção, remover voto (desvotou)
      await ctx.db.delete(existingVoteForOption._id);
      await ctx.db.patch(args.pollOptionId, {
        votesCount: Math.max(0, option.votesCount - 1),
      });
      await ctx.db.patch(args.pollId, {
        totalVotes: Math.max(0, poll.totalVotes - 1),
      });
      return { action: "unvoted" };
    }

    // Se não permite múltipla escolha e já votou em OUTRA opção, remover votos anteriores
    if (!poll.allowMultipleChoice && existingVotes.length > 0) {
      // Remover todos os votos anteriores (são de outras opções já que verificamos acima)
      for (const vote of existingVotes) {
        await ctx.db.delete(vote._id);
        const oldOption = await ctx.db.get(vote.pollOptionId);
        if (oldOption) {
          await ctx.db.patch(vote.pollOptionId, {
            votesCount: Math.max(0, oldOption.votesCount - 1),
          });
        }
        // IMPORTANTE: Quando remove um voto antigo, NÃO decrementa totalVotes
        // porque vamos adicionar um novo voto logo em seguida (substituição)
      }
    }

    // Adicionar novo voto
    await ctx.db.insert("pollVotes", {
      pollId: args.pollId,
      pollOptionId: args.pollOptionId,
      participantIdentifier: args.participantIdentifier,
    });

    await ctx.db.patch(args.pollOptionId, {
      votesCount: option.votesCount + 1,
    });

    await ctx.db.patch(args.pollId, {
      totalVotes: poll.totalVotes + 1,
    });

    return { action: "voted" };
  },
});

// Verificar votos do participante
export const getParticipantVotes = query({
  args: {
    pollId: v.id("polls"),
    participantIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll_participant", (q) =>
        q
          .eq("pollId", args.pollId)
          .eq("participantIdentifier", args.participantIdentifier)
      )
      .collect();

    return votes.map((v) => v.pollOptionId);
  },
});

// Deletar enquete
export const deletePoll = mutation({
  args: { id: v.id("polls") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    // Deletar votos
    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_poll_participant", (q) => q.eq("pollId", args.id))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    // Deletar opções
    const options = await ctx.db
      .query("pollOptions")
      .withIndex("by_poll", (q) => q.eq("pollId", args.id))
      .collect();

    for (const option of options) {
      await ctx.db.delete(option._id);
    }

    // Deletar enquete
    await ctx.db.delete(args.id);
  },
});

// Obter resultados detalhados
export const getResults = query({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.pollId);
    if (!poll) {
      return null;
    }

    const options = await ctx.db
      .query("pollOptions")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .collect();

    return {
      poll,
      options: options.map((option) => ({
        ...option,
        percentage:
          poll.totalVotes > 0
            ? Math.round((option.votesCount / poll.totalVotes) * 100)
            : 0,
      })),
    };
  },
});

// Desativar enquetes expiradas (função interna para cron)
export const deactivateExpiredPolls = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    
    // Buscar todas as enquetes ativas com temporizador
    const activePolls = await ctx.db
      .query("polls")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const poll of activePolls) {
      // Se tem expiresAt e já passou do tempo
      if (poll.expiresAt && now >= poll.expiresAt) {
        await ctx.db.patch(poll._id, { 
          isActive: false,
        });
        console.log(`[deactivateExpiredPolls] Enquete ${poll._id} desativada automaticamente`);
      }
    }
  },
});
