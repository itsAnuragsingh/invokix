// lib/plans/limits.ts
// ─── Single source of truth for all plan-based feature limits ───────────────

export type PlanName = "free" | "pro" | "team"

export type PlanLimits = {
  /** Max number of API contracts (projects) the user can create */
  maxContracts: number
  /** Max team members per project (including owner) */
  maxTeamMembers: number
  /** Max AI generations per calendar month */
  maxAiGenerationsPerMonth: number
  /** How many recent versions are visible (Infinity = all) */
  maxVisibleVersions: number
  /** Max CLI tokens the user can create */
  maxCliTokens: number
  /** Can roll back to a previous version */
  canRollback: boolean
  /** Breaking change detection gate */
  canBreakingChangeGate: boolean
  /** Mock server & API response validator */
  canMockAndValidator: boolean
  /** Environment manager (dev, staging, prod) */
  canEnvironments: boolean
  /** Slack & Discord webhook alerts */
  canAlerts: boolean
  /** Consumer tracking */
  canConsumerTracking: boolean
  /** CLI access (npx invokix pull) */
  canCli: boolean
  /** Shareable contract page */
  canSharePage: boolean
  /** Multiple workspaces */
  canMultipleWorkspaces: boolean
  /** Role-based access control */
  canRbac: boolean
  /** Contract analytics */
  canAnalytics: boolean
}

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: {
    maxContracts: 3,
    maxTeamMembers: 3,
    maxAiGenerationsPerMonth: 25,
    maxVisibleVersions: 5,
    maxCliTokens: 5,
    canRollback: true,
    canBreakingChangeGate: false,
    canMockAndValidator: false,
    canEnvironments: false,
    canAlerts: false,
    canConsumerTracking: false,
    canCli: true,
    canSharePage: true,
    canMultipleWorkspaces: false,
    canRbac: false,
    canAnalytics: false,
  },
  pro: {
    maxContracts: Infinity,
    maxTeamMembers: 10,
    maxAiGenerationsPerMonth: 500,
    maxVisibleVersions: Infinity,
    maxCliTokens: Infinity,
    canRollback: true,
    canBreakingChangeGate: true,
    canMockAndValidator: true,
    canEnvironments: true,
    canAlerts: true,
    canConsumerTracking: true,
    canCli: true,
    canSharePage: true,
    canMultipleWorkspaces: true,
    canRbac: true,
    canAnalytics: true,
  },
  team: {
    maxContracts: Infinity,
    maxTeamMembers: 10,
    maxAiGenerationsPerMonth: 500,
    maxVisibleVersions: Infinity,
    maxCliTokens: Infinity,
    canRollback: true,
    canBreakingChangeGate: true,
    canMockAndValidator: true,
    canEnvironments: true,
    canAlerts: true,
    canConsumerTracking: true,
    canCli: true,
    canSharePage: true,
    canMultipleWorkspaces: true,
    canRbac: true,
    canAnalytics: true,
  },
} as const

/** Human-readable plan labels for the UI */
export const PLAN_DISPLAY: Record<PlanName, { label: string; badge: string }> = {
  free: { label: "Free", badge: "Free" },
  pro: { label: "Pro", badge: "Pro" },
  team: { label: "Team", badge: "Team" },
}
