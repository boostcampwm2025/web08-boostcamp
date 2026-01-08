import { Hero } from "./sections/Hero";
import { ActionCards } from "./sections/ActionCards";
import { FeatureCards } from "./sections/FeatureCards";

export default function MainPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-4xl">
        <Hero />
        <ActionCards />
        <FeatureCards />
      </div>
    </div>
  );
}
