import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameDetail } from "@/components/game-scores";
import { HeaderLink, SiteHeader } from "@/components/site-header";
import { PixelBackArrow } from "@/components/ui";
import { GAMES, findGame } from "@/data/games";

export function generateStaticParams() {
  return GAMES.map((game) => ({ id: game.id }));
}

export async function generateMetadata({ params }: PageProps<"/games/[id]">): Promise<Metadata> {
  const game = findGame((await params).id);
  return game ? { title: game.name } : {};
}

export default async function GamePage({ params }: PageProps<"/games/[id]">) {
  const game = findGame((await params).id);
  if (!game) notFound();

  return (
    <>
      <SiteHeader>
        <HeaderLink href="/">
          <PixelBackArrow />
          <span>MY TIER BOARD</span>
        </HeaderLink>
      </SiteHeader>
      <GameDetail gameId={game.id} />
    </>
  );
}
