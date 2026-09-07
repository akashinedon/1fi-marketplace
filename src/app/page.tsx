import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";

// Always hit the API — this is a live catalog, not static content.
export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await fetchProducts();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Smartphones on EMI
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Pick a phone, choose a variant, and spread the cost with an EMI plan
          backed by a mutual fund.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-zinc-500">No products available right now.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
