import { Zap, MousePointer2, FileCode } from 'lucide-react';
import { PROJECT_NAME } from '@codejam/common';
import { FeatureCard } from '../cards/FeatureCard';

export function FeatureCards() {
  return (
    <div className="border-border border-t">
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <h2 className="text-foreground font-mono text-3xl font-bold">
          Why {PROJECT_NAME}?
        </h2>
        <p className="text-muted-foreground">
          복잡한 설정은 걷어내고, 핵심 기능만 담았습니다
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <FeatureCard
          icon={Zap}
          title="로그인 없는 즉시 시작"
          description="복잡한 가입 절차 없이, 버튼 클릭 한 번으로 나만의 코딩 룸을 생성하세요."
          colorKey="blue"
        />
        <FeatureCard
          icon={MousePointer2}
          title="실시간 동시 편집"
          description="팀원의 커서를 실시간으로 따라가며, 지연 없는 동시 코딩을 경험하세요."
          colorKey="green"
        />
        <FeatureCard
          icon={FileCode}
          title="언어 & 파일 지원"
          description="다양한 프로그래밍 언어 선택과 파일 업로드/다운로드를 지원합니다."
          colorKey="orange"
        />
      </ul>
    </div>
  );
}
