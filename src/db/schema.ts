import {
  pgTable,
  serial,
  text,
  varchar,
  numeric,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * A phone (or any physical good) that can be bought outright or on EMI.
 * `slug` is what shows up in the URL: /products/iphone-17-pro
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  name: varchar("name", { length: 191 }).notNull(),
  brand: varchar("brand", { length: 96 }).notNull(),
  category: varchar("category", { length: 96 }).notNull().default("smartphones"),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * A purchasable configuration of a product, e.g. "256GB · Silver".
 * Price/MRP/image live here because they differ per variant.
 */
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 191 }).notNull(),
  storage: varchar("storage", { length: 32 }),
  color: varchar("color", { length: 32 }),
  mrp: numeric("mrp", { precision: 10, scale: 2 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

/**
 * A selectable EMI plan for a specific variant. `fundName`/`fundType` are
 * presentational flavor for "EMI backed by a mutual fund" — no real fund
 * integration, just metadata shown in the UI.
 */
export const emiPlans = pgTable("emi_plans", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  planLabel: varchar("plan_label", { length: 96 }).notNull(),
  tenureMonths: integer("tenure_months").notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  monthlyAmount: numeric("monthly_amount", { precision: 10, scale: 2 }).notNull(),
  cashbackAmount: numeric("cashback_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  fundName: varchar("fund_name", { length: 96 }),
  fundType: varchar("fund_type", { length: 32 }),
  isRecommended: boolean("is_recommended").notNull().default(false),
});

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  emiPlans: many(emiPlans),
}));

export const emiPlansRelations = relations(emiPlans, ({ one }) => ({
  variant: one(productVariants, {
    fields: [emiPlans.variantId],
    references: [productVariants.id],
  }),
}));
