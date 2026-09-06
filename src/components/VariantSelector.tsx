import { formatCurrency } from "@/lib/format";
import type { ProductVariantDto } from "@/server/products";

export function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: {
  variants: ProductVariantDto[];
  selectedId: number;
  onSelect: (variantId: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Variant
      </span>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant.id)}
              aria-pressed={isSelected}
              className={`rounded-xl border px-3.5 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              }`}
            >
              <span className="block font-medium">{variant.label}</span>
              <span
                className={`block text-xs ${
                  isSelected ? "text-white/70 dark:text-zinc-900/70" : "text-zinc-500"
                }`}
              >
                {formatCurrency(variant.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
