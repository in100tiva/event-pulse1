import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  organizations: defineTable({
    name: v.string(),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  organizationUsers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"]),

  events: defineTable({
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
    shareLinkCode: v.string(),
    imageUrl: v.optional(v.string()),
  })
    .index("by_organization", ["organizationId"])
    .index("by_share_code", ["shareLinkCode"]),

  attendanceConfirmations: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    email: v.string(),
    status: v.union(v.literal("vou"), v.literal("talvez"), v.literal("nao_vou")),
    checkedIn: v.boolean(),
    checkInTime: v.optional(v.number()),
    noShow: v.optional(v.boolean()),
  })
    .index("by_event", ["eventId"])
    .index("by_event_email", ["eventId", "email"]),

  suggestions: defineTable({
    eventId: v.id("events"),
    content: v.string(),
    authorName: v.optional(v.string()),
    isAnonymous: v.boolean(),
    status: v.union(
      v.literal("pendente"),
      v.literal("aprovada"),
      v.literal("rejeitada")
    ),
    isAnswered: v.boolean(),
    votesCount: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_status", ["eventId", "status"])
    .index("by_event_votes", ["eventId", "votesCount"]),

  suggestionVotes: defineTable({
    suggestionId: v.id("suggestions"),
    participantIdentifier: v.string(),
  }).index("by_suggestion_participant", ["suggestionId", "participantIdentifier"]),

  polls: defineTable({
    eventId: v.id("events"),
    question: v.string(),
    allowMultipleChoice: v.boolean(),
    showResultsAutomatically: v.boolean(),
    isActive: v.boolean(),
    totalVotes: v.number(),
    timerDuration: v.optional(v.number()), // Duração do timer em segundos (30, 60, 90, 120)
    activatedAt: v.optional(v.number()), // Timestamp de quando foi ativada
    expiresAt: v.optional(v.number()), // Timestamp de quando deve expirar
  })
    .index("by_event", ["eventId"])
    .index("by_event_active", ["eventId", "isActive"]),

  pollOptions: defineTable({
    pollId: v.id("polls"),
    optionText: v.string(),
    votesCount: v.number(),
  }).index("by_poll", ["pollId"]),

  pollVotes: defineTable({
    pollId: v.id("polls"),
    pollOptionId: v.id("pollOptions"),
    participantIdentifier: v.string(),
  }).index("by_poll_participant", ["pollId", "participantIdentifier"]),

  waitlist: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    whatsapp: v.string(),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_created", ["eventId", "createdAt"]),
});
