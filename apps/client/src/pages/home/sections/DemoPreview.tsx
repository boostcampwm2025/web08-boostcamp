import { PROJECT_NAME } from '@codejam/common';

export function DemoPreview() {
  return (
    <figure className="border-border w-full max-w-5xl overflow-hidden rounded-2xl border bg-white shadow-xl dark:bg-zinc-900">
      <div className="border-border bg-muted flex h-10 items-center gap-2 border-b px-4">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="ml-4 flex h-6 flex-1 items-center rounded-md border border-zinc-200 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-800">
          <span className="text-muted-foreground font-mono text-[10px]">
            🔒 https://lets-codejam.vercel.app/room/demo
          </span>
        </div>
      </div>
      <img
        src="/demo-preview.gif"
        alt={`${PROJECT_NAME} 데모 화면`}
        className="aspect-video w-full object-cover"
      />
    </figure>
  );
}
