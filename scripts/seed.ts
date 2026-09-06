/**
 * Seeds the database with sample products, variants, and EMI plans.
 * Run with: npx dotenv -e .env.local -- npx tsx scripts/seed.ts
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { emiPlans, productVariants, products } from "../src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

type SeedEmiPlan = {
  planLabel: string;
  tenureMonths: number;
  interestRate: string;
  monthlyAmount: string;
  cashbackAmount: string;
  fundName?: string;
  fundType?: string;
  isRecommended?: boolean;
};

type SeedVariant = {
  label: string;
  storage: string;
  color: string;
  mrp: string;
  price: string;
  imageUrl: string;
  isDefault?: boolean;
  emiPlans: SeedEmiPlan[];
};

type SeedProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  variants: SeedVariant[];
};

// EMI plans are generated per variant price so the numbers stay consistent;
// this helper builds a realistic no-cost + interest-bearing spread.
function buildEmiPlans(price: number): SeedEmiPlan[] {
  const round = (n: number) => Math.round(n).toString();
  return [
    {
      planLabel: "No Cost EMI",
      tenureMonths: 3,
      interestRate: "0",
      monthlyAmount: round(price / 3),
      cashbackAmount: "0",
      fundName: "Axis Liquid Fund",
      fundType: "Debt",
      isRecommended: false,
    },
    {
      planLabel: "No Cost EMI",
      tenureMonths: 6,
      interestRate: "0",
      monthlyAmount: round(price / 6),
      cashbackAmount: "0",
      fundName: "Axis Liquid Fund",
      fundType: "Debt",
      isRecommended: true,
    },
    {
      planLabel: "No Cost EMI",
      tenureMonths: 9,
      interestRate: "0",
      monthlyAmount: round(price / 9),
      cashbackAmount: round(price * 0.01),
      fundName: "ICICI Prudential Bluechip Fund",
      fundType: "Equity",
      isRecommended: false,
    },
    {
      planLabel: "Standard EMI",
      tenureMonths: 12,
      interestRate: "10.5",
      monthlyAmount: round((price * 1.058) / 12),
      cashbackAmount: round(price * 0.02),
      fundName: "ICICI Prudential Bluechip Fund",
      fundType: "Equity",
      isRecommended: false,
    },
    {
      planLabel: "Standard EMI",
      tenureMonths: 18,
      interestRate: "10.5",
      monthlyAmount: round((price * 1.087) / 18),
      cashbackAmount: round(price * 0.03),
      fundName: "HDFC Balanced Advantage Fund",
      fundType: "Hybrid",
      isRecommended: false,
    },
  ];
}

const seedData: SeedProduct[] = [
  {
    slug: "iphone-17-pro",
    name: "Apple iPhone 17 Pro",
    brand: "Apple",
    category: "smartphones",
    description:
      "The latest Apple flagship with a titanium frame, A19 Pro chip, and a pro-grade camera system.",
    variants: [
      {
        label: "256GB · Silver",
        storage: "256GB",
        color: "Silver",
        mrp: "139900",
        price: "134900",
        imageUrl: "https://placehold.co/600x600/e8e8ed/1d1d1f?text=iPhone+17+Pro%0A256GB+Silver",
        isDefault: true,
        emiPlans: buildEmiPlans(134900),
      },
      {
        label: "512GB · Deep Blue",
        storage: "512GB",
        color: "Deep Blue",
        mrp: "159900",
        price: "153900",
        imageUrl: "https://placehold.co/600x600/1d3557/ffffff?text=iPhone+17+Pro%0A512GB+Deep+Blue",
        emiPlans: buildEmiPlans(153900),
      },
    ],
  },
  {
    slug: "samsung-galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "smartphones",
    description:
      "Samsung's top-tier Galaxy with a built-in S Pen, 200MP camera, and a titanium build.",
    variants: [
      {
        label: "256GB · Titanium Gray",
        storage: "256GB",
        color: "Titanium Gray",
        mrp: "129999",
        price: "119999",
        imageUrl: "https://placehold.co/600x600/6b7280/ffffff?text=Galaxy+S24+Ultra%0A256GB+Gray",
        isDefault: true,
        emiPlans: buildEmiPlans(119999),
      },
      {
        label: "512GB · Titanium Black",
        storage: "512GB",
        color: "Titanium Black",
        mrp: "144999",
        price: "134999",
        imageUrl: "https://placehold.co/600x600/111111/ffffff?text=Galaxy+S24+Ultra%0A512GB+Black",
        emiPlans: buildEmiPlans(134999),
      },
    ],
  },
  {
    slug: "oneplus-13",
    name: "OnePlus 13",
    brand: "OnePlus",
    category: "smartphones",
    description:
      "Flagship killer with a Snapdragon 8 Elite chip, Hasselblad camera tuning, and 100W fast charging.",
    variants: [
      {
        label: "256GB · Midnight Black",
        storage: "256GB",
        color: "Midnight Black",
        mrp: "72999",
        price: "69999",
        imageUrl: "https://placehold.co/600x600/1a1a1a/ffffff?text=OnePlus+13%0A256GB+Black",
        isDefault: true,
        emiPlans: buildEmiPlans(69999),
      },
      {
        label: "512GB · Arctic Dawn",
        storage: "512GB",
        color: "Arctic Dawn",
        mrp: "79999",
        price: "76999",
        imageUrl: "https://placehold.co/600x600/dbeafe/1e3a5f?text=OnePlus+13%0A512GB+Arctic+Dawn",
        emiPlans: buildEmiPlans(76999),
      },
    ],
  },
];

async function seed() {
  console.log("Clearing existing data...");
  await db.delete(emiPlans);
  await db.delete(productVariants);
  await db.delete(products);

  for (const p of seedData) {
    console.log(`Inserting product: ${p.name}`);
    const [product] = await db
      .insert(products)
      .values({
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        category: p.category,
        description: p.description,
      })
      .returning();

    for (const v of p.variants) {
      const [variant] = await db
        .insert(productVariants)
        .values({
          productId: product.id,
          label: v.label,
          storage: v.storage,
          color: v.color,
          mrp: v.mrp,
          price: v.price,
          imageUrl: v.imageUrl,
          isDefault: v.isDefault ?? false,
        })
        .returning();

      await db.insert(emiPlans).values(
        v.emiPlans.map((plan) => ({
          variantId: variant.id,
          ...plan,
        }))
      );
    }
  }

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
