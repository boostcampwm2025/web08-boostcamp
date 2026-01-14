import { CodeXml, Zap, UserCog } from 'lucide-react';
import { FeatureCard } from '../cards/FeatureCard';

export function FeatureCards() {
  return (
    <section className="mb-16 border-t border-gray-200">
      <h2 className="py-12 text-3xl font-bold font-mono text-center text-gray-800">
        Features
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
        <FeatureCard
          icon={Zap}
          title="실시간 동기화"
          description="끊김 없고 빠른 실시간 협업"
          colorKey="red"
        />
        <FeatureCard
          icon={CodeXml}
          title="다양한 언어 지원"
          description="문법 하이라이팅 및 자동완성"
          colorKey="orange"
        />
        <FeatureCard
          icon={UserCog}
          title="권한 관리"
          description="방장의 편집 권한 제어"
          colorKey="green"
        />
      </div>
    </section>
  );
}
