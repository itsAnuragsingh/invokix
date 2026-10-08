// lib/db/schema.ts
import { pgTable, text, integer, boolean, jsonb, timestamp, date } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  dodoCustomerId: text("dodo_customer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isPublic: boolean("is_public").notNull().default(false),
  lintRules: jsonb("lint_rules"),
  stack: text("stack", {
    enum: ["nextjs", "react-native", "express", "angular", "other"],
  })
    .notNull()
    .default("nextjs"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const contracts = pgTable("contracts", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  plainEnglish: text("plain_english"),
  openApiSpec: jsonb("open_api_spec"),
  version: text("version").notNull().default("1.0"),
  healthScore: integer("health_score").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const contractVersions = pgTable("contract_versions", {
  id: text("id").primaryKey(),
  contractId: text("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  openApiSpec: jsonb("open_api_spec").notNull(),
  version: text("version").notNull(),
  changedBy: text("changed_by").notNull().references(() => users.id),
  changeSummary: text("change_summary"),
  isBreaking: boolean("is_breaking").notNull().default(false),
  breakingFields: text("breaking_fields").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const teamMembers = pgTable("team_members", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "editor", "viewer"] }).notNull().default("viewer"),
  invitedBy: text("invited_by").references(() => users.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  joinedAt: timestamp("joined_at"),
})

export const environments = pgTable("environments", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  baseUrl: text("base_url").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const consumers = pgTable("consumers", {
  id: text("id").primaryKey(),
  contractId: text("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  version: text("version").notNull(),
  lastPulledAt: timestamp("last_pulled_at").notNull().defaultNow(),
  source: text("source", { enum: ["web", "cli", "api", "postman"] }).notNull().default("web"),
  teamId: text("team_id"),
})

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  slackWebhookUrl: text("slack_webhook_url"),
  discordWebhookUrl: text("discord_webhook_url"),
  emailList: text("email_list").array(),
  alertOnBreaking: boolean("alert_on_breaking").notNull().default(true),
  alertOnAny: boolean("alert_on_any").notNull().default(false),
})

export const deprecations = pgTable("deprecations", {
  id: text("id").primaryKey(),
  contractId: text("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  fieldPath: text("field_path").notNull(),
  reason: text("reason"),
  sunsetDate: date("sunset_date"),
  affectedConsumers: jsonb("affected_consumers"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  plan: text("plan", { enum: ["free", "pro", "team"] }).notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  razorpayCustomerId: text("razorpay_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  dodoCustomerId: text("dodo_customer_id"),
  dodoSubscriptionId: text("dodo_subscription_id"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const aiGenerations = pgTable("ai_generations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const invites = pgTable("invites", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role", { enum: ["editor", "viewer"] }).notNull().default("viewer"),
  token: text("token").notNull().unique(),
  invitedBy: text("invited_by").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})


export const cliTokens = pgTable("cli_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),            // "laptop", "github-actions"
  token: text("token").notNull().unique(), // ik_live_... shown once on creation
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
 
export const cliSessions = pgTable("cli_sessions", {
  id: text("id").primaryKey(),              // random id passed in browser URL
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  token: text("token"),                     // filled after user confirms in browser
  confirmedAt: timestamp("confirmed_at"),   // filled when confirmed
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})


export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category", {
    enum: ["payments", "auth", "storage", "messaging", "ecommerce", "analytics", "other"],
  }).notNull().default("other"),
  openApiSpec: jsonb("open_api_spec").notNull(),
  tags: text("tags").array().notNull().default([]),
  forkCount: integer("fork_count").notNull().default(0),
  isPublic: boolean("is_public").notNull().default(true),
  createdBy: text("created_by").references(() => users.id),
  healthScore: integer("health_score").notNull().default(0),
  endpointCount: integer("endpoint_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const platformSettings = pgTable("platform_settings", {
  id: text("id").primaryKey().default("default"),
  billingMode: text("billing_mode", { enum: ["beta", "all"] }).notNull().default("beta"),
  betaEmails: text("beta_emails").array().notNull().default([]),
  adminEmails: text("admin_emails").array().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})