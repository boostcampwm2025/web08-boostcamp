import { PROJECT_NAME } from '@codejam/common';

export function DemoPreview() {
  return (
    <figure className="w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
      <div className="flex h-10 items-center gap-2 border-b border-gray-100 bg-gray-50 px-4">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="ml-4 flex h-6 flex-1 items-center rounded-md border border-gray-200 bg-white px-3">
          <span className="font-mono text-[10px] text-gray-400">
            🔒 https://lets-{PROJECT_NAME.toLowerCase()}.vercel.app/room/demo
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
