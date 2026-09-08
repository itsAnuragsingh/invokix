// lib/permissions.ts
// Central RBAC utility for Invokix.
// Every route, server action, and UI component that needs role-gating imports from here.

export type Role = "owner" | "editor" | "viewer"

const ROLE_PRIORITY: Record<Role, number> = {
  owner: 3,
  editor: 2,
  viewer: 1,
}

/** Returns true if `role` meets or exceeds `minimum`. */
export function hasMinRole(role: Role, minimum: Role): boolean {
  return ROLE_PRIORITY[role] >= ROLE_PRIORITY[minimum]
}

/** editor or owner can make edits to contract/codegen. */
export function canEdit(role: Role): boolean {
  return hasMinRole(role, "editor")
}

/** Only owner can invite, remove, or change roles. */
export function canManageMembers(role: Role): boolean {
  return role === "owner"
}

/** editor or owner can publish a contract. */
export function canPublish(role: Role): boolean {
  return hasMinRole(role, "editor")
}

/** Only owner can delete the project. */
export function canDeleteProject(role: Role): boolean {
  return role === "owner"
}

/** Only owner can change project settings (name, stack, notifications). */
export function canChangeSettings(role: Role): boolean {
  return role === "owner"
}

/** Human-readable label. */
export function roleLabel(role: Role): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

/**
 * Roles an owner can assign when inviting.
 * Owner cannot be invited — it's set when the project is created.
 */
export const ASSIGNABLE_ROLES: Role[] = ["editor", "viewer"]