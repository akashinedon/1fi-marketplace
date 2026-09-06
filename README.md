# 1Fi Marketplace — Product + EMI Plans

A full-stack product page that lists phones, lets you pick a variant, and choose from EMI plans
"backed by mutual funds" (a small presentational twist on top of a standard EMI marketplace,
in the spirit of 1Fi's SIP/investing identity). Built for the 1Fi SDE1 assignment.

Reference: [Snapmint iPhone 17 Pro EMI page](https://snapmint.com/p/apple-iphone-17-pro-silver-256-gb-smart-phones-on-emi)

## Tech stack

- **Framework**: Next.js 16 (App Router) — a single project serves both the React/Tailwind
  frontend and the JSON API (Route Handlers), deployed together on Vercel.
- **Styling**: Tailwind CSS v4.
- **Database**: Postgres, provisioned via [Neon](https://neon.tech) (Vercel Marketplace
  integration — connection string auto-injected as `DATABASE_URL`).
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) + `drizzle-kit` for schema push/migrations.
- **Language**: TypeScript throughout (schema, API routes, components).

## Project structure

```
src/
  app/
    page.tsx                    # Product listing ("/")
    products/[slug]/page.tsx    # Product detail ("/products/:slug")
    products/[slug]/loading.tsx # Skeleton loading state
    not-found.tsx / error.tsx   # 404 / error boundaries
    api/
      products/route.ts         # GET /api/products
      products/[slug]/route.ts  # GET /api/products/:slug
  components/                   # ProductCard, VariantSelector, EmiPlanCard, ProductDetailView
  server/products.ts            # DB query layer shared by pages and API routes
  db/
    schema.ts                   # Drizzle schema (products, product_variants, emi_plans)
    index.ts                    # Lazy DB client
  lib/format.ts                 # Currency formatting helper
scripts/seed.ts                 # Seed script — 3 products x 2 variants x 5 EMI plans
drizzle.config.ts
```

## Setup and run instructions

### Prerequisites
- Node.js 20+
- A Postgres database (Neon recommended — see below), or any Postgres instance

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the database
If you have the Vercel CLI linked to this project, the Neon integration already injects
`DATABASE_URL` into `.env.local` — just run:
```bash
vercel env pull .env.local --yes
```
Otherwise, create a `.env.local` with your own Postgres connection string:
```
DATABASE_URL=postgres://user:password@host/dbname?sslmode=require
```

### 3. Push the schema
```bash
npx dotenv -e .env.local -- npx drizzle-kit push
```

### 4. Seed sample data (3 products, 2 variants each, 5 EMI plans per variant)
```bash
npx dotenv -e .env.local -- npx tsx scripts/seed.ts
```

### 5. Run the app
```bash
npm run dev
```
Visit `http://localhost:3000`.

### Production build
```bash
npm run build
npm run start
```

## API endpoints

### `GET /api/products`
Returns a summary of every product (used by the listing page).

**Example response:**
```json
{
  "products": [
    {
      "id": 1,
      "slug": "iphone-17-pro",
      "name": "Apple iPhone 17 Pro",
      "brand": "Apple",
      "category": "smartphones",
      "thumbnail": "https://placehold.co/600x600/e8e8ed/1d1d1f?text=iPhone+17+Pro",
      "startingPrice": 134900,
      "startingMrp": 139900
    }
  ]
}
```

### `GET /api/products/:slug`
Returns full product detail: every variant, each with its own EMI plans.

**Example:** `GET /api/products/iphone-17-pro`
```json
{
  "product": {
    "id": 1,
    "slug": "iphone-17-pro",
    "name": "Apple iPhone 17 Pro",
    "brand": "Apple",
    "category": "smartphones",
    "description": "The latest Apple flagship with a titanium frame, A19 Pro chip, and a pro-grade camera system.",
    "thumbnail": "https://placehold.co/600x600/e8e8ed/1d1d1f?text=iPhone+17+Pro",
    "startingPrice": 134900,
    "startingMrp": 139900,
    "variants": [
      {
        "id": 1,
        "label": "256GB · Silver",
        "storage": "256GB",
        "color": "Silver",
        "mrp": 139900,
        "price": 134900,
        "imageUrl": "https://placehold.co/600x600/e8e8ed/1d1d1f?text=iPhone+17+Pro",
        "isDefault": true,
        "emiPlans": [
          {
            "id": 1,
            "planLabel": "No Cost EMI",
            "tenureMonths": 3,
            "interestRate": 0,
            "monthlyAmount": 44967,
            "cashbackAmount": 0,
            "fundName": "Axis Liquid Fund",
            "fundType": "Debt",
            "isRecommended": false
          },
          {
            "id": 4,
            "planLabel": "Standard EMI",
            "tenureMonths": 12,
            "interestRate": 10.5,
            "monthlyAmount": 11894,
            "cashbackAmount": 2698,
            "fundName": "ICICI Prudential Bluechip Fund",
            "fundType": "Equity",
            "isRecommended": false
          }
        ]
      }
    ]
  }
}
```
Returns `404 { "error": "Product not found" }` for an unknown slug.

## Database schema

Three tables, one-to-many down the chain (`products` → `product_variants` → `emi_plans`),
defined in [`src/db/schema.ts`](./src/db/schema.ts):

| Table              | Columns                                                                                                   |
|---------------------|-------------------------------------------------------------------------------------------------------------|
| `products`          | `id`, `slug` (unique — used in the URL), `name`, `brand`, `category`, `description`, `created_at`           |
| `product_variants`  | `id`, `product_id` (FK), `label`, `storage`, `color`, `mrp`, `price`, `image_url`, `is_default`              |
| `emi_plans`         | `id`, `variant_id` (FK), `plan_label`, `tenure_months`, `interest_rate`, `monthly_amount`, `cashback_amount`, `fund_name`, `fund_type`, `is_recommended` |

`fund_name` / `fund_type` are presentational metadata for the "backed by a mutual fund" framing
(e.g. "Axis Liquid Fund" / "Debt") — no real fund integration.

Seed data lives in [`scripts/seed.ts`](./scripts/seed.ts): iPhone 17 Pro, Samsung Galaxy S24
Ultra, and OnePlus 13, each with 2 variants and 5 EMI plans per variant.

## Notes

- The "Proceed with selected plan" CTA is a mock confirmation only (no payment/order is
  persisted) — validates a plan is selected and shows a confirmation message client-side.
- Product images are placeholders (`placehold.co`) generated per variant; swap
  `imageUrl` values in `scripts/seed.ts` for real product photography if needed.
