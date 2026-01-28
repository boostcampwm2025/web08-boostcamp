import { PROJECT_NAME } from '@codejam/common';
import logoAnimation from '@/assets/logo_animation.svg';

export function Hero() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center pt-4 pb-2 md:pt-8 md:pb-4">
      {/* 상단 배지 */}
      <div className="animate-in fade-in zoom-in hover:border-brand-blue/30 mb-4 inline-flex cursor-default items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm transition-colors delay-100 duration-700">
        <span className="relative flex h-2 w-2">
          <span className="bg-brand-green absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
          <span className="bg-brand-green relative inline-flex h-2 w-2 rounded-full"></span>
        </span>
        <span className="text-xs font-bold tracking-wide text-gray-600 uppercase">
          Live Sync Editor
        </span>
      </div>

      {/* 로고 영역 */}
      <div className="animate-in fade-in slide-in-from-bottom-4 mb-4 flex flex-col items-center gap-4 delay-200 duration-700">
        <div className="group relative">
          <div className="from-brand-blue/30 to-brand-green/30 absolute -inset-8 rounded-full bg-gradient-to-tr opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-60" />

          <img
            src={logoAnimation}
            alt={`${PROJECT_NAME} Logo`}
            className="relative h-20 w-20 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3 md:h-24 md:w-24"
          />
        </div>

        <h1 className="text-center text-5xl leading-tight font-extrabold tracking-tight md:text-6xl">
          <span className="text-brand-blue">Code</span>
          <span className="text-brand-green">Jam</span>
        </h1>
      </div>

      {/* 설명 */}
      <p className="animate-in fade-in slide-in-from-bottom-4 max-w-2xl px-4 text-center text-lg leading-relaxed break-keep text-gray-500 delay-300 duration-700 md:text-xl">
        로그인 없이 바로 시작하는 <br className="hidden sm:block" />
        <span className="font-semibold text-gray-900">
          실시간 협업 코드 에디터
        </span>
      </p>
    </section>
  );
}
