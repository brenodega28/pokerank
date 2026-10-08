import { Panel } from "@/components/ui";

const KOFI_URL = "https://ko-fi.com/brenogomes99786";

function PixelCoffeeCup() {
  return (
    <svg width="64" height="64" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true" className="flex-none">
      <path fill="#B8B8C8" d="M5 1h1v1H5zM6 2h1v1H6zM5 3h1v1H5zM9 0h1v1H9zM10 1h1v1h-1zM9 2h1v1H9zM10 3h1v1h-1z" />
      <path fill="var(--color-ink)" d="M2 5h10v1H2zM2 6h1v8H2zM11 6h1v8h-1zM3 14h8v1H3zM12 7h2v1h-2zM14 8h1v4h-1zM12 12h2v1h-2z" />
      <path fill="#8A5A30" d="M3 6h8v1H3z" />
      <path fill="var(--color-cream)" d="M3 7h8v7H3z" />
      <path fill="#D8D8D0" d="M10 7h1v7h-1z" />
      <path fill="var(--color-accent)" d="M3 9h8v2H3z" />
      <path fill="#8890C0" d="M1 15h12v1H1z" />
    </svg>
  );
}

export function SupportPanel({ frameClassName = "" }: { frameClassName?: string }) {
  return (
    <Panel
      as="section"
      aria-labelledby="support-title"
      frameClassName={frameClassName}
      className="flex flex-wrap items-center gap-x-7 gap-y-[18px] px-[22px] py-5"
    >
      <PixelCoffeeCup />
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-2.5">
        <h2 id="support-title" className="m-0 font-display text-[15px] leading-[1.3] font-normal">
          SUPPORT POKÉRANKED
        </h2>
        <p className="m-0 text-[17px] leading-[1.4] text-subtle">
          Enjoying the site? Buy me a coffee on Ko-fi to help keep PokéRanked running.
        </p>
      </div>
      <a
        href={KOFI_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[50px] items-center justify-center border-3 border-ink bg-accent px-[18px] font-display text-xs leading-[1.2] text-white no-underline shadow-raised-accent-strong text-shadow-on-accent"
      >
        SUPPORT ON KO-FI
      </a>
    </Panel>
  );
}
