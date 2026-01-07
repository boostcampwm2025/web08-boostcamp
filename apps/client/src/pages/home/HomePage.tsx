import { CodeXml, Zap, UserCog } from "lucide-react";
import { Hero } from "./sections/Hero";
import { CreateRoomCard } from "./cards/CreateRoomCard";
import { JoinRoomCard } from "./cards/JoinRoomCard";
import { FeatureCard } from "./cards/FeatureCard";

export default function MainPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-3xl">
        <Hero />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
          <CreateRoomCard />
          <JoinRoomCard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <FeatureCard
            icon={Zap}
            title="실시간 동기화"
            description="끊김 없고 빠른 실시간 협업"
            colorScheme="red"
          />
          <FeatureCard
            icon={CodeXml}
            title="다양한 언어 지원"
            description="문법 하이라이팅 및 자동완성"
            colorScheme="orange"
          />
          <FeatureCard
            icon={UserCog}
            title="권한 관리"
            description="방장의 편집 권한 제어"
            colorScheme="green"
          />
        </div>
      </div>
    </div>
  );
}
