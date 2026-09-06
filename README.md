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
      "thumbnail": "/products/iphone-17-pro-deep-blue.jpg",
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
    "thumbnail": "/products/iphone-17-pro-deep-blue.jpg",
    "startingPrice": 134900,
    "startingMrp": 139900,
    "variants": [
      {
        "id": 1,
        "label": "256GB · Deep Blue",
        "storage": "256GB",
        "color": "Deep Blue",
        "mrp": 139900,
        "price": 134900,
        "imageUrl": "/products/iphone-17-pro-deep-blue.jpg",
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
- Product images are real photos of each phone (Apple iPhone 17 Pro, Samsung Galaxy S24
  Ultra, OnePlus 13), sourced from Wikimedia Commons under free licenses (CC-BY-SA /
  CC0) and served locally from `public/products/`. Swap `imageUrl` values in
  `scripts/seed.ts` to point elsewhere if needed.

## Image credits

Product photos in `public/products/` are from [Wikimedia Commons](https://commons.wikimedia.org),
used under their respective free licenses (CC-BY-SA 4.0 or CC0) — see each file's Commons page
for the specific license and photographer credit:

| File | Source |
|------|--------|
| `iphone-17-pro-deep-blue.jpg` | [File:IPhone 17 Pro (cropped).jpg](https://commons.wikimedia.org/wiki/File:IPhone_17_Pro_(cropped).jpg) |
| `iphone-17-pro-cosmic-orange.jpg` | [File:IPhone 17 Pro backside (Cosmic Orange) (Oct 1, 2025).jpg](https://commons.wikimedia.org/wiki/File:IPhone_17_Pro_backside_(Cosmic_Orange)_(Oct_1,_2025).jpg) |
| `galaxy-s24-ultra-titanium-gray.jpg` | [File:Samsung Galaxy S24 Ultra Backside.jpg](https://commons.wikimedia.org/wiki/File:Samsung_Galaxy_S24_Ultra_Backside.jpg) |
| `galaxy-s24-ultra-titanium-black.jpg` | [File:Back view of Samsung Galaxy S24 Ultra Black.jpg](https://commons.wikimedia.org/wiki/File:Back_view_of_Samsung_Galaxy_S24_Ultra_Black.jpg) |
| `oneplus-13-midnight-black.jpg` | [File:OnePlus 13 back.jpg](https://commons.wikimedia.org/wiki/File:OnePlus_13_back.jpg) |
