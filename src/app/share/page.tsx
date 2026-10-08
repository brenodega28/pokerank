import type { Metadata } from "next";
import { HeaderLink, SiteHeader } from "@/components/site-header";
import { SharedRanking } from "@/components/shared-ranking";

export const metadata: Metadata = {
  title: "shared ranking",
  robots: { index: false },
};

export default function SharePage() {
  return (
    <>
      <SiteHeader>
        <HeaderLink href="/">
          <span>MAKE YOUR OWN</span>
        </HeaderLink>
      </SiteHeader>
      <main className="mx-auto flex max-w-[1240px] flex-col gap-5 px-[clamp(16px,4vw,40px)] pt-7 pb-16">
        <SharedRanking />
      </main>
    </>
  );
}
