import { computed } from '@angular/core';

/** Spartan visual style ids (demo / host theme switchers). */
export type SpartanStyleId = 'nova' | 'vega' | 'lyra' | 'maia' | 'mira' | 'luma';

export const SPARTAN_STYLE_IDS = [
  'nova',
  'vega',
  'lyra',
  'maia',
  'mira',
  'luma',
] as const satisfies readonly SpartanStyleId[];

/**
 * One baked look on Spartan theme tokens.
 * Radii follow `var(--radius)` so a host style switcher (or app theme) can restyle
 * without shipping six class maps in this package.
 */
const RECIPE: Record<string, string> = {
  'spartan-color-surface': 'rounded-[var(--radius)]',
  'spartan-button':
    'rounded-[var(--radius)] border border-transparent bg-clip-padding text-sm font-medium focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px',
  'spartan-button-size-icon': 'inline-flex size-8 items-center justify-center',
  'spartan-button-size-xs':
    'inline-flex h-6 items-center justify-center gap-1 rounded-[var(--radius)] px-2 text-xs',
  'spartan-button-size-sm':
    'inline-flex h-7 items-center justify-center gap-1 rounded-[var(--radius)] px-2.5 text-xs',
  'spartan-button-variant-default':
    'bg-primary text-primary-foreground hover:bg-primary/80',
  'spartan-button-variant-outline':
    'border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground',
  'spartan-button-variant-ghost':
    'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground',
  'spartan-button-variant-secondary':
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
  'spartan-input':
    'dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-8 rounded-[var(--radius)] border bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:ring-3',
  'spartan-popover-content':
    'bg-popover text-popover-foreground ring-foreground/10 flex flex-col gap-2.5 rounded-[var(--radius)] p-2.5 text-sm shadow-md ring-1',
};

export function expandSpartanClasses(className: string): string {
  return className
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => RECIPE[token] ?? token)
    .join(' ');
}

/** Expand recipe tokens. Safe to call inside `computed()`. */
export function hlmStyle(...parts: Array<string | false | null | undefined>): string {
  return expandSpartanClasses(parts.filter(Boolean).join(' '));
}

/** Reactive class string for templates: `[class]="styleClass()"`. */
export function styleClass(...parts: Array<string | false | null | undefined>) {
  return computed(() => hlmStyle(...parts));
}
