import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const savedAnalyses = mysqlTable("saved_analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  epoch: int("epoch").notNull().default(0),
  name: varchar("name", { length: 255 }).notNull(),
  nodeCount: int("nodeCount").notNull(),
  edgeCount: int("edgeCount").notNull(),
  currentDispersion: text("currentDispersion").notNull(),
  candidateDispersion: text("candidateDispersion").notNull(),
  epsilon: text("epsilon").notNull(),
  adaptationMetric: varchar("adaptationMetric", { length: 64 }).notNull().default("0"),
  decision: varchar("decision", { length: 32 }).notNull(),
  engineVersion: varchar("engineVersion", { length: 64 }).default("onsour-rts-v1.0.0").notNull(),
  numericMode: varchar("numericMode", { length: 32 }).default("fixed-q32").notNull(),
  governanceVersion: varchar("governanceVersion", { length: 32 }).default("v1").notNull(),
  schemaVersion: varchar("schemaVersion", { length: 32 }).default("v1").notNull(),
  snapshotHash: varchar("snapshotHash", { length: 128 }).default("sha256-genesis").notNull(),
  stateRoot: varchar("stateRoot", { length: 128 }).default("0x00000000").notNull(),
  payloadJson: text("payloadJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedAnalysis = typeof savedAnalyses.$inferSelect;
export type InsertSavedAnalysis = typeof savedAnalyses.$inferInsert;