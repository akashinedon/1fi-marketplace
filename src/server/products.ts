import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { emiPlans, productVariants, products } from "@/db/schema";

export type EmiPlanDto = {
  id: number;
  planLabel: string;
  tenureMonths: number;
  interestRate: number;
  monthlyAmount: number;
  cashbackAmount: number;
  fundName: string | null;
  fundType: string | null;
  isRecommended: boolean;
};

export type ProductVariantDto = {
  id: number;
  label: string;
  storage: string | null;
  color: string | null;
  mrp: number;
  price: number;
  imageUrl: string;
  isDefault: boolean;
  emiPlans: EmiPlanDto[];
};

export type ProductSummaryDto = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  thumbnail: string;
  startingPrice: number;
  startingMrp: number;
};

export type ProductDetailDto = ProductSummaryDto & {
  description: string;
  variants: ProductVariantDto[];
};

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

/**
 * Product + variant listing for the marketplace grid. One row per product,
 * priced at its cheapest variant, thumbnail from its default (or first) variant.
 */
export async function getAllProducts(): Promise<ProductSummaryDto[]> {
  const db = getDb();
  const rows = await db.query.products.findMany({
    with: {
      variants: true,
    },
    orderBy: (p, { asc }) => [asc(p.id)],
  });

  return rows.map((row) => {
    const sortedVariants = [...row.variants].sort(
      (a, b) => toNumber(a.price) - toNumber(b.price)
    );
    const cheapest = sortedVariants[0];
    const thumb = row.variants.find((v) => v.isDefault) ?? row.variants[0];

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      brand: row.brand,
      category: row.category,
      thumbnail: thumb?.imageUrl ?? "",
      startingPrice: cheapest ? toNumber(cheapest.price) : 0,
      startingMrp: cheapest ? toNumber(cheapest.mrp) : 0,
    };
  });
}

/**
 * Full product detail: every variant, each with its own EMI plans, keyed by slug
 * for the /products/[slug] route. Returns null if no product matches.
 */
export async function getProductBySlug(
  slug: string
): Promise<ProductDetailDto | null> {
  const db = getDb();
  const row = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      variants: {
        with: {
          emiPlans: true,
        },
      },
    },
  });

  if (!row) return null;

  const variants: ProductVariantDto[] = row.variants
    .map((v) => ({
      id: v.id,
      label: v.label,
      storage: v.storage,
      color: v.color,
      mrp: toNumber(v.mrp),
      price: toNumber(v.price),
      imageUrl: v.imageUrl,
      isDefault: v.isDefault,
      emiPlans: v.emiPlans
        .map((plan) => ({
          id: plan.id,
          planLabel: plan.planLabel,
          tenureMonths: plan.tenureMonths,
          interestRate: toNumber(plan.interestRate),
          monthlyAmount: toNumber(plan.monthlyAmount),
          cashbackAmount: toNumber(plan.cashbackAmount),
          fundName: plan.fundName,
          fundType: plan.fundType,
          isRecommended: plan.isRecommended,
        }))
        .sort((a, b) => a.tenureMonths - b.tenureMonths),
    }))
    .sort((a, b) => a.price - b.price);

  const cheapest = variants[0];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    description: row.description,
    thumbnail: (variants.find((v) => v.isDefault) ?? cheapest)?.imageUrl ?? "",
    startingPrice: cheapest?.price ?? 0,
    startingMrp: cheapest?.mrp ?? 0,
    variants,
  };
}
