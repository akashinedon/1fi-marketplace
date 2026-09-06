"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/format";
import type { ProductDetailDto } from "@/server/products";
import { VariantSelector } from "./VariantSelector";
import { EmiPlanCard } from "./EmiPlanCard";

export function ProductDetailView({ product }: { product: ProductDetailDto }) {
  const defaultVariant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];

  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant.id);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(
    defaultVariant.emiPlans.find((p) => p.isRecommended)?.id ??
      defaultVariant.emiPlans[0]?.id ??
      null
  );
  const [confirmedPlanId, setConfirmedPlanId] = useState<number | null>(null);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? defaultVariant;

  const selectedPlan = useMemo(
    () => selectedVariant.emiPlans.find((p) => p.id === selectedPlanId) ?? null,
    [selectedVariant, selectedPlanId]
  );

  function handleVariantChange(variantId: number) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return;
    setSelectedVariantId(variantId);
    setConfirmedPlanId(null);
    // Keep the same tenure selected across variants when possible, otherwise
    // fall back to that variant's recommended (or first) plan.
    const samePlan = variant.emiPlans.find(
      (p) => p.tenureMonths === selectedPlan?.tenureMonths
    );
    setSelectedPlanId(
      samePlan?.id ??
        variant.emiPlans.find((p) => p.isRecommended)?.id ??
        variant.emiPlans[0]?.id ??
        null
    );
  }

  function handlePlanSelect(planId: number) {
    setSelectedPlanId(planId);
    setConfirmedPlanId(null);
  }

  function handleProceed() {
    if (!selectedPlan) return;
    setConfirmedPlanId(selectedPlan.id);
  }

  const hasDiscount = selectedVariant.mrp > selectedVariant.price;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-900">
        <Image
          key={selectedVariant.imageUrl}
          src={selectedVariant.imageUrl}
          alt={`${product.name} — ${selectedVariant.label}`}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {product.brand}
          </span>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{product.description}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(selectedVariant.price)}
          </span>
          {hasDiscount ? (
            <span className="text-sm text-zinc-400 line-through">
              {formatCurrency(selectedVariant.mrp)}
            </span>
          ) : null}
        </div>

        <VariantSelector
          variants={product.variants}
          selectedId={selectedVariantId}
          onSelect={handleVariantChange}
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Choose an EMI plan
          </span>
          <div className="flex flex-col gap-2">
            {selectedVariant.emiPlans.map((plan) => (
              <EmiPlanCard
                key={plan.id}
                plan={plan}
                isSelected={plan.id === selectedPlanId}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleProceed}
          disabled={!selectedPlan}
          className="w-full rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Proceed with selected plan
        </button>

        {confirmedPlanId && selectedPlan ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            Plan confirmed — {formatCurrency(selectedPlan.monthlyAmount)}/mo for{" "}
            {selectedPlan.tenureMonths} months. This is a demo confirmation;
            no payment has been processed.
          </div>
        ) : null}
      </div>
    </div>
  );
}
