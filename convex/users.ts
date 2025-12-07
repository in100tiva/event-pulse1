import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Criar ou atualizar usuário baseado nos dados do Clerk
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        avatarUrl: args.avatarUrl,
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      avatarUrl: args.avatarUrl,
    });
  },
});

// Obter usuário atual
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

// Criar organização
export const createOrganization = mutation({
  args: {
    name: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      clerkId: args.clerkId,
    });

    await ctx.db.insert("organizationUsers", {
      organizationId: orgId,
      userId: user._id,
      role: "admin",
    });

    return orgId;
  },
});

// Obter organizações do usuário
export const getUserOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const orgUsers = await ctx.db
      .query("organizationUsers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const organizations = await Promise.all(
      orgUsers.map(async (orgUser) => {
        const org = await ctx.db.get(orgUser.organizationId);
        return org ? { ...org, role: orgUser.role } : null;
      })
    );

    return organizations.filter((org) => org !== null);
  },
});

// Sincronizar organização do Clerk
export const syncOrganization = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    // Buscar o usuário atual
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    let orgId;

    if (existingOrg) {
      await ctx.db.patch(existingOrg._id, {
        name: args.name,
      });
      orgId = existingOrg._id;
    } else {
      orgId = await ctx.db.insert("organizations", {
        name: args.name,
        clerkId: args.clerkId,
      });
    }

    // Verificar se o usuário já está associado a esta organização
    const existingMembership = await ctx.db
      .query("organizationUsers")
      .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    // Se não estiver associado, criar a associação
    if (!existingMembership) {
      await ctx.db.insert("organizationUsers", {
        organizationId: orgId,
        userId: user._id,
        role: "admin",
      });
    }

    return orgId;
  },
});

// Obter organização por Clerk ID
export const getOrganizationByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});
