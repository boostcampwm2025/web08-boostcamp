import { Zap, MousePointer2, FileCode } from 'lucide-react';
import { FeatureCard } from '../cards/FeatureCard';

export function FeatureCards() {
  return (
    <section className="mb-16 border-t border-gray-100">
      <div className="py-12 flex flex-col items-center text-center gap-2">
        <h2 className="text-3xl font-bold font-mono text-gray-900">
          Why CodeJam?
        </h2>
        <p className="text-gray-500 font-medium">
          복잡한 설정은 걷어내고, 핵심 기능만 담았습니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {/* 1. Zero-Config */}
        <FeatureCard
          icon={Zap}
          title="로그인 없는 즉시 시작"
          description="복잡한 가입 절차 없이, 버튼 클릭 한 번으로 나만의 코딩 룸을 생성하세요."
          colorKey="blue"
        />

        {/* 2. Real-time Collaboration */}
        <FeatureCard
          icon={MousePointer2}
          title="실시간 동시 편집"
          description="팀원의 커서를 실시간으로 따라가며, 지연 없는 동시 코딩을 경험하세요."
          colorKey="green"
        />

        {/* 3. Smart Editor */}
        <FeatureCard
          icon={FileCode}
          title="언어 & 파일 지원"
          description="다양한 프로그래밍 언어 선택과 파일 업로드/다운로드를 지원합니다."
          colorKey="orange"
        />
      </div>
    </section>
  );
}
