import type { ComponentPropsWithoutRef, ReactNode } from "react";

type PanelProps = ComponentPropsWithoutRef<"div"> & {
  as?: "div" | "section" | "aside";
};

export function Panel({ as: Element = "div", className = "", ...props }: PanelProps) {
  return <Element className={`border-4 border-ink bg-cream shadow-panel ${className}`} {...props} />;
}

const BUTTON_VARIANTS = {
  light: "bg-cream text-ink shadow-raised",
  highlight: "bg-highlight text-ink shadow-raised-highlight",
  accent: "bg-accent text-white shadow-raised-accent text-shadow-on-accent",
} as const;

export function pixelButtonClass(variant: keyof typeof BUTTON_VARIANTS = "light"): string {
  return `inline-flex min-h-11 items-center justify-center gap-2 border-3 border-ink px-3 font-display text-[10px] leading-[1.2] no-underline ${BUTTON_VARIANTS[variant]}`;
}

export function PixelBackArrow() {
  return (
    <svg width="8" height="14" viewBox="0 0 4 7" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="currentColor" d="M4 0v7H3v-1H2v-1H1v-1H0v-1h1V2h1V1h1V0z" />
    </svg>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="box-border h-[22px] border-3 border-ink bg-meter p-[3px]"
    >
      <div className="h-full bg-meter-fill shadow-[inset_0_-4px_0_var(--color-meter-edge)]" style={{ width: `${percent}%` }} />
    </div>
  );
}

export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`font-display text-[11px] leading-[1.3] text-muted ${className}`}>{children}</span>;
}
