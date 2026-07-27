import { signal } from '@angular/core';
import type { SpartanStyleId } from 'ngx-spartan-color-picker';
import { SPARTAN_STYLE_MAPS } from './spartan-style-maps';

export type { SpartanStyleId };

/**
 * Demo-only runtime style id for the site helm chrome (Nova/Vega/…).
 * Lives in the site UI layer — not part of the published color-picker API.
 */
export const spartanStyle = signal<SpartanStyleId>('vega');

/**
 * Expand helm tokens for the active demo style.
 * Color picker chrome uses theme tokens + `--radius` (set by the landing page),
 * so it tracks the switcher without shipping style maps in the package.
 */
export function expandSpartanClasses(className: string): string {
  const map: Record<string, string> = SPARTAN_STYLE_MAPS[spartanStyle()];
  return className
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => map[token] ?? token)
    .join(' ');
}
