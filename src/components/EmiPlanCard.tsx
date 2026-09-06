import { formatCurrency } from "@/lib/format";
import type { EmiPlanDto } from "@/server/products";

export function EmiPlanCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: EmiPlanDto;
  isSelected: boolean;
  onSelect: (planId: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(plan.id)}
      aria-pressed={isSelected}
      className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-colors ${
        isSelected
          ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/40"
          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            isSelected
              ? "border-emerald-500 bg-emerald-500"
              : "border-zinc-300 dark:border-zinc-700"
          }`}
        >
          {isSelected ? (
            <span className="h-2 w-2 rounded-full bg-white" />
          ) : null}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(plan.monthlyAmount)}/mo
            </span>
            <span className="text-xs text-zinc-500">
              &times; {plan.tenureMonths} months
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500">
            <span>
              {plan.interestRate > 0
                ? `${plan.interestRate}% interest`
                : "0% interest"}
            </span>
            {plan.cashbackAmount > 0 ? (
              <>
                <span aria-hidden>&middot;</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(plan.cashbackAmount)} cashback
                </span>
              </>
            ) : null}
          </div>
          {plan.fundName ? (
            <div className="mt-1 text-[11px] text-zinc-400">
              Builds into: {plan.fundName}
              {plan.fundType ? ` (${plan.fundType})` : ""}
            </div>
          ) : null}
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        {plan.planLabel}
      </span>
    </button>
  );
}
