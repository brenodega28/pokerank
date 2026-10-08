import { SiteHeader } from "@/components/site-header";
import { TierBoard } from "@/components/tier-board";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-[1240px] flex-col gap-5 px-[clamp(16px,4vw,40px)] pt-7 pb-16">
        <TierBoard />
      </main>
    </>
  );
}
