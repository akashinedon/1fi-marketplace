export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid animate-pulse gap-8 md:grid-cols-2">
        <div className="aspect-square w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-7 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-20 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-40 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-12 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
