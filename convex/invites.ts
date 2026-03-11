import { InviteLinks } from "convex-invite-links";
import { components } from "./_generated/api.js";
import { mutation, query } from "./_generated/server.js";
import { v } from "convex/values";

const invites = new InviteLinks(components.inviteLinks, {
  defaultExpiryMs: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// ─── Group Management ────────────────────────────────────────

/** Create or update a group */
export const upsertGroup = mutation({
  args: { groupId: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await invites.upsertGroup(ctx, args);
  },
});

/** Get group details */
export const getGroup = query({
  args: { groupId: v.string() },
  handler: async (ctx, args) => {
    return await invites.getGroup(ctx, args);
  },
});

// ─── Membership ──────────────────────────────────────────────

/** Add a member to a group directly */
export const addMember = mutation({
  args: {
    userId: v.string(),
    groupId: v.string(),
    addedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await invites.addMember(ctx, args);
  },
});

/** Remove a member from a group */
export const removeMember = mutation({
  args: { userId: v.string(), groupId: v.string() },
  handler: async (ctx, args) => {
    return await invites.removeMember(ctx, args);
  },
});

/** Check if a user is a member of a group */
export const isMember = query({
  args: { userId: v.string(), groupId: v.string() },
  handler: async (ctx, args) => {
    return await invites.isMember(ctx, args);
  },
});

/** List all members of a group */
export const getAllMembers = query({
  args: { groupId: v.string() },
  handler: async (ctx, args) => {
    return await invites.getAllMembers(ctx, args);
  },
});

/** List all groups for a user */
export const getAllGroups = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await invites.getAllGroups(ctx, args);
  },
});

// ─── Resource Access ─────────────────────────────────────────

/** Grant resource access */
export const grantAccess = mutation({
  args: {
    userId: v.string(),
    resourceId: v.string(),
    grantedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await invites.grantAccess(ctx, args);
  },
});

/** Revoke resource access */
export const revokeAccess = mutation({
  args: { userId: v.string(), resourceId: v.string() },
  handler: async (ctx, args) => {
    return await invites.revokeAccess(ctx, args);
  },
});

/** Check if user has access to a resource */
export const hasAccess = query({
  args: { userId: v.string(), resourceId: v.string() },
  handler: async (ctx, args) => {
    return await invites.hasAccess(ctx, args);
  },
});

// ─── Invite Management ───────────────────────────────────────

/** Create an invite */
export const createInvite = mutation({
  args: {
    email: v.optional(v.string()),
    groupId: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    expiresInHours: v.optional(v.number()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expiresAt = args.expiresInHours
      ? Date.now() + args.expiresInHours * 60 * 60 * 1000
      : undefined;

    const result = await invites.makeInvite(ctx, {
      email: args.email,
      groupId: args.groupId,
      resourceId: args.resourceId,
      expiresAt,
      createdBy: args.createdBy,
      ogTitle: "You're invited!",
      ogDescription: args.groupId
        ? `Join group ${args.groupId}`
        : "Accept this invite to get access",
    });

    return result;
  },
});

/** List invites (all statuses) */
export const listAllInvites = query({
  args: {
    groupId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await invites.listInvites(ctx, {
      groupId: args.groupId,
      includeClaimed: true,
      includeRevoked: true,
      includeExpired: true,
    });
  },
});

/** Revoke an invite by token */
export const revokeInviteByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await invites.revokeInviteByToken(ctx, args);
  },
});

/** Claim an invite */
export const claimInvite = mutation({
  args: {
    token: v.string(),
    userId: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await invites.claimInvite(ctx, args);
  },
});

/** Get invite details by token */
export const getInviteByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await invites.getInviteByToken(ctx, args);
  },
});

/** Delete old invites */
export const cleanupOldInvites = mutation({
  args: {},
  handler: async (ctx) => {
    return await invites.deleteOldInvites(ctx, {
      olderThanMs: 30 * 24 * 60 * 60 * 1000,
    });
  },
});
