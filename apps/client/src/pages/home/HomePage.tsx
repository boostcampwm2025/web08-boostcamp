import { Hero } from './sections/Hero';
import { ActionCards } from './sections/ActionCards';
import { FeatureCards } from './sections/FeatureCards';

export default function MainPage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#fafafa] selection:bg-brand-blue/20">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_20%,#000_60%,transparent_100%)] z-0 pointer-events-none" />

      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-blue/10 blur-[120px] mix-blend-multiply animate-pulse z-0 pointer-events-none" />
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-green/10 blur-[120px] mix-blend-multiply animate-pulse delay-1000 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-12">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-full max-w-3xl">
            <Hero />
          </div>
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <ActionCards />
          </div>
        </div>

        <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="relative w-full max-w-5xl group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue/30 via-purple-500/30 to-brand-green/30 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

            <div className="relative rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* 브라우저 상단 바 */}
              <div className="h-10 border-b border-gray-100 bg-gray-50/50 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                {/* 가짜 주소창 */}
                <div className="ml-4 flex-1 max-w-md h-6 bg-white border border-gray-200 rounded-md flex items-center px-3">
                  <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                    <span className="text-green-500">🔒</span>{' '}
                    https://lets-codejam.vercel.app/room/demo-mode
                  </span>
                </div>
              </div>

              <div className="aspect-[16/9] bg-gray-50 flex items-center justify-center relative overflow-hidden">
                <img
                  src="/demo-preview.gif"
                  alt="CodeJam Demo"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <FeatureCards />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-gray-400 font-mono border-t border-gray-100 mt-12">
        <p>© 2026 CodeJam. All rights reserved.</p>
      </footer>
    </main>
  );
}
