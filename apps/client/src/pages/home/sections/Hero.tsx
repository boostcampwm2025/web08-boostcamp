import logoAnimation from '@/assets/logo_animation.svg';

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center pt-4 pb-2 md:pt-8 md:pb-4 relative z-10">
      {/* 상단 배지 */}
      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm animate-in fade-in zoom-in duration-700 delay-100 hover:border-brand-blue/30 transition-colors cursor-default">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
        </span>
        <span className="text-xs font-bold text-gray-600 tracking-wide uppercase">
          Live Sync Editor
        </span>
      </div>

      {/* 로고 영역 */}
      <div className="flex flex-col items-center gap-4 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <div className="relative group">
          <div className="absolute -inset-8 bg-gradient-to-tr from-brand-blue/30 to-brand-green/30 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

          <img
            src={logoAnimation}
            alt="CodeJam Logo"
            className="relative w-20 h-20 md:w-24 md:h-24 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3"
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-center leading-tight">
          <span className="text-brand-blue">Code</span>
          <span className="text-brand-green">Jam</span>
        </h1>
      </div>

      {/* 설명 */}
      <p className="text-lg md:text-xl text-gray-500 text-center max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 px-4 break-keep">
        로그인 없이 바로 시작하는 <br className="hidden sm:block" />
        <span className="text-gray-900 font-semibold">
          실시간 협업 코드 에디터
        </span>
      </p>
    </section>
  );
}
