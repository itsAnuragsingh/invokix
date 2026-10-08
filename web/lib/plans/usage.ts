// lib/plans/usage.ts
// ─── Helpers to fetch user plan, count usage, and check limits ──────────────

import { db } from "@/lib/db"
import { subscriptions, projects, teamMembers, aiGenerations, contracts } from "@/lib/db/schema"
import { eq, and, gte, sql, inArray } from "drizzle-orm"
import { nanoid } from "nanoid"
import { PLAN_LIMITS, type PlanName, type PlanLimits } from "./limits"

// ── Get current plan for a user ─────────────────────────────────────────────
export async function getUserPlan(userId: string): Promise<PlanName> {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
    columns: { plan: true, expiresAt: true },
  })

  if (!sub) return "free"

  if (sub.expiresAt && new Date() > sub.expiresAt) return "free"

  return sub.plan as PlanName
}

// ── Get plan limits for a user ──────────────────────────────────────────────
export async function getUserLimits(userId: string): Promise<PlanLimits & { plan: PlanName }> {
  const plan = await getUserPlan(userId)
  return { ...PLAN_LIMITS[plan], plan }
}

// ── Count user's total contracts (across all projects) ──────────────────────
export async function countUserContracts(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects)
    .where(eq(projects.ownerId, userId))   // ← count owned projects directly

  return result[0]?.count ?? 0
}

// ── Count team members for a project (including owner) ──────────────────────
export async function countProjectTeamMembers(projectId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teamMembers)
    .where(eq(teamMembers.projectId, projectId))

  return result[0]?.count ?? 0
}

// ── Count AI generations for a user this calendar month ─────────────────────
export async function countMonthlyAiGenerations(userId: string): Promise<number> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiGenerations)
    .where(
      and(
        eq(aiGenerations.userId, userId),
        gte(aiGenerations.createdAt, startOfMonth)
      )
    )

  return result[0]?.count ?? 0
}

// ── Record an AI generation ─────────────────────────────────────────────────
export async function recordAiGeneration(userId: string, projectId: string) {
  await db.insert(aiGenerations).values({
    id: nanoid(),
    userId,
    projectId,
  })
}

// ── Generic limit checker ───────────────────────────────────────────────────
export type LimitCheck = {
  allowed: boolean
  current: number
  limit: number
  plan: PlanName
}

export async function checkContractLimit(userId: string): Promise<LimitCheck> {
  const plan = await getUserPlan(userId)
  const limits = PLAN_LIMITS[plan]
  const current = await countUserContracts(userId)

  return {
    allowed: current < limits.maxContracts,
    current,
    limit: limits.maxContracts,
    plan,
  }
}

export async function checkTeamMemberLimit(userId: string, projectId: string): Promise<LimitCheck> {
  const plan = await getUserPlan(userId)
  const limits = PLAN_LIMITS[plan]
  const current = await countProjectTeamMembers(projectId)

  return {
    allowed: current < limits.maxTeamMembers,
    current,
    limit: limits.maxTeamMembers,
    plan,
  }
}

export async function checkAiGenerationLimit(userId: string): Promise<LimitCheck> {
  const plan = await getUserPlan(userId)
  const limits = PLAN_LIMITS[plan]
  const current = await countMonthlyAiGenerations(userId)

  return {
    allowed: current < limits.maxAiGenerationsPerMonth,
    current,
    limit: limits.maxAiGenerationsPerMonth,
    plan,
  }
}

export async function checkFeatureAccess(
  userId: string,
  feature: keyof PlanLimits
): Promise<{ allowed: boolean; plan: PlanName }> {
  const plan = await getUserPlan(userId)
  const limits = PLAN_LIMITS[plan]
  const value = limits[feature]

  return {
    allowed: typeof value === "boolean" ? value : true,
    plan,
  }
}