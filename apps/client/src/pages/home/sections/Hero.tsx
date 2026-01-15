import logoAnimation from '@/assets/logo_animation.svg';

export function Hero() {
  return (
    <div className="text-center my-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="inline-flex flex-col items-center gap-4 mb-6">
        <img src={logoAnimation} alt="CodeJam Logo" className="h-16 w-16" />
        <div className="flex items-center gap-2 font-mono">
          <h1 className="text-5xl font-bold">
            <span style={{ color: '#2F81F7' }}>Code</span>
            <span style={{ color: '#33BD7F' }}>Jam</span>
          </h1>
        </div>
      </div>
      <p className="text-gray-600 text-xl max-w-2xl mx-auto font-mono">
        로그인 없이 바로 시작하는 실시간 협업 코드 에디터
      </p>
    </div>
  );
}
