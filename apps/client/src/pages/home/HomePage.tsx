import { PROJECT_NAME } from '@codejam/common';
import { Hero } from './sections/Hero';
import { CreateRoomCard } from './cards/CreateRoomCard';
import { JoinRoomCard } from './cards/JoinRoomCard';
import { DemoPreview } from './sections/DemoPreview';
import { FeatureCards } from './sections/FeatureCards';

export default function HomePage() {
  return (
    <main className="bg-primary-foreground relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] mask-[radial-gradient(ellipse_80%_80%_at_50%_20%,#000_60%,transparent_100%)] bg-size-[20px_20px]" />

      <div className="bg-brand-blue/10 pointer-events-none absolute top-[-10%] left-[-10%] z-0 h-[40%] w-[40%] animate-pulse rounded-full mix-blend-multiply blur-[120px]" />
      <div className="bg-brand-green/10 pointer-events-none absolute top-[20%] right-[-10%] z-0 h-[40%] w-[40%] animate-pulse rounded-full mix-blend-multiply blur-[120px] delay-1000" />

      <article className="relative mx-auto max-w-6xl space-y-12 px-6 py-8 md:py-12">
        <header className="flex flex-col items-center">
          <Hero />
        </header>

        <section className="grid w-full grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:gap-12">
          <CreateRoomCard />
          <JoinRoomCard />
        </section>

        <section className="my-28 flex justify-center">
          <DemoPreview />
        </section>

        <section>
          <FeatureCards />
        </section>
      </article>

      <div className="mt-20 flex justify-center">
        <div data-boostad-zone className="h-40 w-200"></div>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-100 py-8 text-center font-mono text-xs text-gray-400">
        <p>
          © 2025-{new Date().getFullYear()} {PROJECT_NAME}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
