import type { SpartanStyleId } from 'ngx-spartan-color-picker';

export type { SpartanStyleId };

export interface SpartanStyleOption {
  readonly id: SpartanStyleId;
  readonly label: string;
  /** Theme radius applied on `<html>` so the color picker follows the demo style. */
  readonly radius: string;
}

export const SPARTAN_STYLES: readonly SpartanStyleOption[] = [
  { id: 'nova', label: 'Nova', radius: '0.5rem' },
  { id: 'vega', label: 'Vega', radius: '0.375rem' },
  { id: 'lyra', label: 'Lyra', radius: '0' },
  { id: 'maia', label: 'Maia', radius: '1.5rem' },
  { id: 'mira', label: 'Mira', radius: '0.375rem' },
  { id: 'luma', label: 'Luma', radius: '1rem' },
] as const;

export function getSpartanStyle(id: SpartanStyleId): SpartanStyleOption {
  return SPARTAN_STYLES.find((style) => style.id === id) ?? SPARTAN_STYLES[0];
}
