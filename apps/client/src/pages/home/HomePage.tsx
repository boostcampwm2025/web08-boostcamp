import { PROJECT_NAME } from '@codejam/common';
import { Hero } from './sections/Hero';
import { ActionCards } from './sections/ActionCards';
import { FeatureCards } from './sections/FeatureCards';

export default function MainPage() {
  return (
    <main className="selection:bg-brand-blue/20 relative min-h-screen w-full overflow-x-hidden bg-[#fafafa]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] mask-[radial-gradient(ellipse_80%_80%_at_50%_20%,#000_60%,transparent_100%)] bg-size-[20px_20px]" />

      <div className="bg-brand-blue/10 pointer-events-none fixed top-[-10%] left-[-10%] z-0 h-[40%] w-[40%] animate-pulse rounded-full mix-blend-multiply blur-[120px]" />
      <div className="bg-brand-green/10 pointer-events-none fixed top-[20%] right-[-10%] z-0 h-[40%] w-[40%] animate-pulse rounded-full mix-blend-multiply blur-[120px] delay-1000" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-12 px-6 py-8 md:py-12">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-full max-w-3xl">
            <Hero />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-8 w-full delay-150 duration-700">
            <ActionCards />
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-12 flex w-full justify-center delay-300 duration-1000">
          <div className="group relative w-full max-w-5xl">
            <div className="from-brand-blue/30 to-brand-green/30 absolute -inset-1 rounded-2xl bg-linear-to-r via-purple-500/30 opacity-20 blur-xl transition duration-1000 group-hover:opacity-40"></div>

            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-2xl backdrop-blur-xl">
              {/* 브라우저 상단 바 */}
              <div className="flex h-10 items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                {/* 가짜 주소창 */}
                <div className="ml-4 flex h-6 max-w-md flex-1 items-center rounded-md border border-gray-200 bg-white px-3">
                  <span className="flex items-center gap-1 font-mono text-[10px] text-gray-400">
                    <span className="text-green-500">🔒</span> https://lets-
                    {PROJECT_NAME.toLowerCase()}.vercel.app/room/demo-mode
                  </span>
                </div>
              </div>

              <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gray-50">
                <img
                  src="/demo-preview.gif"
                  alt={`${PROJECT_NAME} Demo`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-8 delay-500 duration-700">
          <FeatureCards />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-100 py-8 text-center font-mono text-xs text-gray-400">
        <p>© 2026 {PROJECT_NAME}. All rights reserved.</p>
      </footer>
    </main>
  );
}
