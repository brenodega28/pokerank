export function SiteFooter() {
  return (
    <footer className="border-t-4 border-ink bg-night">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-[clamp(16px,4vw,40px)] py-5 text-night-text">
        <p className="m-0 font-display text-[10px] leading-[1.6] text-cream">
          © 2026 PokéRanked · Made by Breno Gomes
        </p>
        <p className="m-0 max-w-[760px] text-sm leading-[1.4]">
          PokéRanked is an unofficial fan project. It is not affiliated with, endorsed or sponsored by Nintendo, Game
          Freak, Creatures Inc. or The Pokémon Company. Pokémon and all related names are trademarks of their
          respective owners. Cover art from{" "}
          <a href="https://www.igdb.com" target="_blank" rel="noopener noreferrer" className="text-cream underline">
            IGDB
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
