import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { ProductSummaryDto } from "@/server/products";

export function ProductCard({ product }: { product: ProductSummaryDto }) {
  const hasDiscount = product.startingMrp > product.startingPrice;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="relative aspect-square w-full bg-zinc-50 dark:bg-zinc-900">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {product.brand}
        </span>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(product.startingPrice)}
          </span>
          {hasDiscount ? (
            <span className="text-xs text-zinc-400 line-through">
              {formatCurrency(product.startingMrp)}
            </span>
          ) : null}
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-400">
          EMI from{" "}
          {formatCurrency(Math.round(product.startingPrice / 9))}/mo
        </span>
      </div>
    </Link>
  );
}
