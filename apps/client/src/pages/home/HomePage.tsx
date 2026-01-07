import { Users, Hash, CodeXml, Zap, UserCog } from "lucide-react";
import { Hero } from "./sections/Hero";
import { ActionCard } from "./cards/ActionCard";
import { FeatureCard } from "./cards/FeatureCard";

export default function MainPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-3xl">
        <Hero />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
          <ActionCard
            icon={Users}
            title="방 만들기"
            description="새로운 협업 공간을 생성하고 팀원들을 초대하세요"
            colorKey="blue"
          />
          <ActionCard
            icon={Hash}
            title="방 번호로 입장"
            description="기존 방 번호를 입력하여 협업에 참여하세요"
            colorKey="purple"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
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
      </div>
    </div>
  );
}
