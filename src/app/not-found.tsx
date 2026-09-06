import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-24 text-center">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        We couldn&apos;t find that product
      </h1>
      <p className="text-sm text-zinc-500">
        It may have been removed, or the link is incorrect.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
      >
        Back to marketplace
      </Link>
    </div>
  );
}
