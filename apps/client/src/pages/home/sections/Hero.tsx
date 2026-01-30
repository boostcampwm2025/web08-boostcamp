import { PROJECT_NAME } from '@codejam/common';
import logoAnimation from '@/assets/logo_animation.svg';
import Typewriter from 'typewriter-effect';

export function Hero() {
  return (
    <div className="flex flex-col items-center pt-4 pb-2 md:pt-8 md:pb-4">
      {/* 상단 배지 */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
        <span className="relative flex size-2">
          <span className="bg-brand-green absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
          <span className="bg-brand-green relative inline-flex size-2 rounded-full" />
        </span>
        <span className="text-xs font-bold tracking-wide text-gray-600 uppercase">
          Live Sync Editor
        </span>
      </div>

      {/* 로고 영역 */}
      <div className="mb-4 flex flex-col items-center gap-4">
        <img
          src={logoAnimation}
          alt={`${PROJECT_NAME} Logo`}
          className="size-20 drop-shadow-2xl md:size-24"
        />

        <h1 className="text-center text-5xl leading-tight font-extrabold tracking-tight md:text-6xl">
          <span className="text-brand-blue">Code</span>
          <span className="text-brand-green">Jam</span>
        </h1>
      </div>

      {/* 설명 */}
      <div className="h-14 max-w-2xl px-4 text-center text-lg leading-relaxed break-keep text-gray-500 md:h-16 md:text-xl">
        <Typewriter
          options={{ delay: 90 }}
          onInit={(typewriter) => {
            typewriter
              .typeString('로그인 없이 바로 시작하는<br />')
              .typeString(
                '<span class="font-semibold text-gray-900">온라인 코드</span>',
              )
              .pauseFor(500)
              .deleteChars(6)
              .typeString(
                '<span class="font-semibold text-gray-900">실시간 협업 코드 에디터</span>',
              )
              .start();
          }}
        />
      </div>
    </div>
  );
}
