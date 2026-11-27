import { relations } from "drizzle-orm";
import {
  pgTable, text, timestamp, boolean, index, uuid, jsonb, smallint, numeric, date, time, unique, check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  // 'admin' | 'student'. Lo asigna solo el servidor (input:false en auth.ts).
  role: text("role").default("admin"),
  // Contraseña temporal sin cambiar: el middleware fuerza a cambiarla antes de entrar al panel/portal.
  mustChangePassword: boolean("must_change_password").default(false).notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// ─── Negocio (mismas tablas y ids que en Supabase, sin RLS: la autorización vive en el servidor) ───

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  cover_image: text("cover_image"),
  category: text("category"),
  published: boolean("published").default(false).notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
});

export const students = pgTable(
  "students",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phone: text("phone"),
    weekly_frequency: smallint("weekly_frequency").default(2).notNull(),
    price_per_class: numeric("price_per_class", { precision: 10, scale: 2, mode: "number" }),
    active: boolean("active").default(true).notNull(),
    status_override: text("status_override").$type<"al_dia" | "vencido">(),
    email: text("email").unique(),
    user_id: text("user_id").unique().references(() => user.id, { onDelete: "set null" }),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    check("students_weekly_frequency_check", sql`${t.weekly_frequency} between 1 and 7`),
    check("students_status_override_check", sql`${t.status_override} in ('al_dia','vencido')`),
  ],
);

export const classAttendance = pgTable(
  "class_attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    student_id: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    class_date: date("class_date").notNull(),
    class_time: time("class_time"),
    excused: boolean("excused").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  },
  (t) => [unique("class_attendance_student_id_class_date_key").on(t.student_id, t.class_date)],
);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  student_id: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  paid_at: date("paid_at").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2, mode: "number" }),
  classes_qty: smallint("classes_qty"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
});
