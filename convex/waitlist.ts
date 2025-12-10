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

    const leads = await ctx.db
      .query("waitlist")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Ordenar por data de criação (mais recentes primeiro)
    return leads.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Buscar todos os leads de uma organização
export const getByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    console.log("[waitlist:getByOrganization] Iniciando busca de leads");
    console.log("[waitlist:getByOrganization] organizationId:", args.organizationId);
    
    try {
      const identity = await ctx.auth.getUserIdentity();
      console.log("[waitlist:getByOrganization] Identity:", identity ? "autenticado" : "não autenticado");
      
      if (!identity) {
        console.log("[waitlist:getByOrganization] Usuário não autenticado, retornando array vazio");
        return [];
      }

      // Buscar todos os eventos da organização
      console.log("[waitlist:getByOrganization] Buscando eventos da organização...");
      const events = await ctx.db
        .query("events")
        .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
        .collect();
      
      console.log(`[waitlist:getByOrganization] Encontrados ${events.length} eventos`);

      // Se não há eventos, retornar array vazio
      if (!events || events.length === 0) {
        console.log("[waitlist:getByOrganization] Nenhum evento encontrado, retornando array vazio");
        return [];
      }

      // Para cada evento, buscar os leads
      console.log("[waitlist:getByOrganization] Buscando leads de cada evento...");
      const leadsWithEvent = await Promise.all(
        events.map(async (event) => {
          try {
            console.log(`[waitlist:getByOrganization] Buscando leads do evento ${event._id} (${event.title})`);
            const leads = await ctx.db
              .query("waitlist")
              .withIndex("by_event", (q) => q.eq("eventId", event._id))
              .collect();
            
            console.log(`[waitlist:getByOrganization] Encontrados ${leads.length} leads para o evento ${event.title}`);

            return leads.map((lead) => ({
              ...lead,
              eventTitle: event.title,
              eventStartDateTime: event.startDateTime,
            }));
          } catch (error) {
            // Se houver erro ao buscar leads de um evento específico, retornar array vazio
            console.error(`[waitlist:getByOrganization] ERRO ao buscar leads do evento ${event._id}:`, error);
            return [];
          }n
        })
      );

      // Flatten array e ordenar por data de criação (mais recentes primeiro)
      const allLeads = leadsWithEvent.flat();
      console.log(`[waitlist:getByOrganization] Total de ${allLeads.length} leads encontrados`);
      
      const sortedLeads = allLeads.sort((a, b) => b.createdAt - a.createdAt);
      console.log("[waitlist:getByOrganization] Leads ordenados com sucesso");
      
      return sortedLeads;
    } catch (error) {
      // Se houver qualquer erro, retornar array vazio ao invés de falhar
      console.error("[waitlist:getByOrganization] ERRO FATAL:", error);
      console.error("[waitlist:getByOrganization] Stack trace:", (error as Error).stack);
      return [];
    }
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

