import { headers } from "next/headers";
import type {
  ProductDetailDto,
  ProductSummaryDto,
} from "@/server/products";

/**
 * Resolves this deployment's own origin so Server Components can call the
 * app's own /api/* routes over HTTP (same-origin), rather than reaching into
 * the database service layer directly. Uses the incoming request's Host
 * header, which works the same in local dev and on Vercel without needing a
 * hardcoded public URL env var.
 */
async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1")
    ? "http"
    : "https";
  return `${protocol}://${host}`;
}

/** Fetches the product listing from GET /api/products (never cached — always fresh from the DB). */
export async function fetchProducts(): Promise<ProductSummaryDto[]> {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/products`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load products (status ${res.status})`);
  }

  const { products } = (await res.json()) as { products: ProductSummaryDto[] };
  return products;
}

/** Fetches one product's detail from GET /api/products/:slug. Returns null on a 404. */
export async function fetchProductBySlug(
  slug: string
): Promise<ProductDetailDto | null> {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/products/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`Failed to load product "${slug}" (status ${res.status})`);
  }

  const { product } = (await res.json()) as { product: ProductDetailDto };
  return product;
}
