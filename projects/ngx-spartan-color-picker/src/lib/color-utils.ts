import { CSS_NAMED_COLORS } from './named-colors';

export type Hsva = { h: number; s: number; v: number; a: number };
export type Rgba = { r: number; g: number; b: number; a: number };
export type Hsla = { h: number; s: number; l: number; a: number };
export type Oklch = { l: number; c: number; h: number; a: number };
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch';

/** Panel arrangement: everything stacked, or paged between picker and presets. */
export type ColorPickerLayout = 'stack' | 'pages';

export type ColorPickerPage = 'picker' | 'presets';

/**
 * Lock HSVA channels to fixed values (e.g. opacity-only or grayscale).
 * `brightness` maps to HSV value. Set `clamp` to force picks onto locked channels.
 */
export type ColorLockValues = {
  hue?: number;
  saturation?: number;
  brightness?: number;
  alpha?: number;
  clamp?: boolean;
};

/** Default formats shown in the panel toggle. */
export const COLOR_FORMATS: readonly ColorFormat[] = ['hex', 'rgb', 'hsl'] as const;

/** All supported output formats including optional OKLCH. */
export const ALL_COLOR_FORMATS: readonly ColorFormat[] = ['hex', 'rgb', 'hsl', 'oklch'] as const;

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function hsvaToRgba({ h, s, v, a }: Hsva): Rgba {
  const hue = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = v - c;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: clamp(a),
  };
}

export function rgbaToHsva({ r, g, b, a }: Rgba): Hsva {
  const rn = clamp(r / 255);
  const gn = clamp(g / 255);
  const bn = clamp(b / 255);
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === rn) {
      h = ((gn - bn) / d) % 6;
    } else if (max === gn) {
      h = (bn - rn) / d + 2;
    } else {
      h = (rn - gn) / d + 4;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }

  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max, a: clamp(a) };
}

export function rgbaToHsla({ r, g, b, a }: Rgba): Hsla {
  const rn = clamp(r / 255);
  const gn = clamp(g / 255);
  const bn = clamp(b / 255);
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) {
      h = ((gn - bn) / d) % 6;
    } else if (max === gn) {
      h = (bn - rn) / d + 2;
    } else {
      h = (rn - gn) / d + 4;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }

  return { h, s: clamp(s), l: clamp(l), a: clamp(a) };
}

export function hslaToRgba({ h, s, l, a }: Hsla): Rgba {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s);
  const light = clamp(l);

  if (sat === 0) {
    const channel = Math.round(light * 255);
    return { r: channel, g: channel, b: channel, a: clamp(a) };
  }

  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;

  const hueToRgb = (t: number): number => {
    let temp = t;
    if (temp < 0) {
      temp += 1;
    }
    if (temp > 1) {
      temp -= 1;
    }
    if (temp < 1 / 6) {
      return p + (q - p) * 6 * temp;
    }
    if (temp < 1 / 2) {
      return q;
    }
    if (temp < 2 / 3) {
      return p + (q - p) * (2 / 3 - temp) * 6;
    }
    return p;
  };

  const hk = hue / 360;
  return {
    r: Math.round(hueToRgb(hk + 1 / 3) * 255),
    g: Math.round(hueToRgb(hk) * 255),
    b: Math.round(hueToRgb(hk - 1 / 3) * 255),
    a: clamp(a),
  };
}

function srgbToLinear(channel: number): number {
  const c = clamp(channel);
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(channel: number): number {
  const c = Math.max(0, channel);
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/** sRGB 0–255 → OKLCH (L 0–1, C ≥ 0, H 0–360). */
export function rgbaToOklch({ r, g, b, a }: Rgba): Oklch {
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);

  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) {
    H += 360;
  }

  return { l: clamp(L), c: Math.max(0, C), h: C < 1e-6 ? 0 : H, a: clamp(a) };
}

/** OKLCH → sRGB 0–255. */
export function oklchToRgba({ l, c, h, a }: Oklch): Rgba {
  const L = clamp(l);
  const C = Math.max(0, c);
  const hue = ((h % 360) + 360) % 360;
  const hr = (hue * Math.PI) / 180;
  const A = C * Math.cos(hr);
  const B = C * Math.sin(hr);

  const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = L - 0.0894841775 * A - 1.291485548 * B;

  const lCube = l_ * l_ * l_;
  const mCube = m_ * m_ * m_;
  const sCube = s_ * s_ * s_;

  const lr = +4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
  const lg = -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
  const lb = -0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube;

  return {
    r: clamp(Math.round(linearToSrgb(lr) * 255), 0, 255),
    g: clamp(Math.round(linearToSrgb(lg) * 255), 0, 255),
    b: clamp(Math.round(linearToSrgb(lb) * 255), 0, 255),
    a: clamp(a),
  };
}

function toHexByte(value: number): string {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
}

export function rgbaToHex({ r, g, b, a }: Rgba, withAlpha = false): string {
  const hex = `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
  if (!withAlpha || a >= 1) {
    return hex.toUpperCase();
  }
  return `${hex}${toHexByte(a * 255)}`.toUpperCase();
}

export function hsvaToHex(hsva: Hsva, withAlpha = false): string {
  return rgbaToHex(hsvaToRgba(hsva), withAlpha);
}

function roundAlpha(a: number): number {
  return Math.round(a * 1000) / 1000;
}

function roundPercent(value: number): number {
  return Math.round(value * 1000) / 10;
}

function roundOklch(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function rgbaToCss({ r, g, b, a }: Rgba, format: ColorFormat = 'hex', withAlpha = false): string {
  if (format === 'rgb') {
    if (withAlpha && a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${roundAlpha(a)})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  }

  if (format === 'hsl') {
    const { h, s, l } = rgbaToHsla({ r, g, b, a });
    const hue = Math.round(h);
    const sat = roundPercent(s);
    const light = roundPercent(l);
    if (withAlpha && a < 1) {
      return `hsla(${hue}, ${sat}%, ${light}%, ${roundAlpha(a)})`;
    }
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  }

  if (format === 'oklch') {
    const { l, c, h } = rgbaToOklch({ r, g, b, a });
    const L = roundOklch(l, 3);
    const C = roundOklch(c, 3);
    const H = roundOklch(h, 1);
    if (withAlpha && a < 1) {
      return `oklch(${L} ${C} ${H} / ${roundAlpha(a)})`;
    }
    return `oklch(${L} ${C} ${H})`;
  }

  return rgbaToHex({ r, g, b, a }, withAlpha);
}

export function hsvaToCss(hsva: Hsva, format: ColorFormat = 'hex', withAlpha = false): string {
  return rgbaToCss(hsvaToRgba(hsva), format, withAlpha);
}

export function parseColor(input: string | null | undefined): Rgba | null {
  if (!input) {
    return null;
  }

  const value = input.trim();

  const hexMatch = /^#([0-9a-f]{3,8})$/i.exec(value);
  if (hexMatch) {
    return parseHex(hexMatch[1]);
  }

  const rgbMatch =
    /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(
      value,
    );
  if (rgbMatch) {
    return {
      r: clamp(Math.round(parseFloat(rgbMatch[1])), 0, 255),
      g: clamp(Math.round(parseFloat(rgbMatch[2])), 0, 255),
      b: clamp(Math.round(parseFloat(rgbMatch[3])), 0, 255),
      a: parseAlphaToken(rgbMatch[4]),
    };
  }

  const hslMatch =
    /^hsla?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(
      value,
    );
  if (hslMatch) {
    return hslaToRgba({
      h: parseFloat(hslMatch[1]),
      s: clamp(parseFloat(hslMatch[2]) / 100),
      l: clamp(parseFloat(hslMatch[3]) / 100),
      a: parseAlphaToken(hslMatch[4]),
    });
  }

  const oklchMatch =
    /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)$/i.exec(value);
  if (oklchMatch) {
    const lRaw = oklchMatch[1];
    const L = lRaw.endsWith('%') ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
    return oklchToRgba({
      l: clamp(L),
      c: Math.max(0, parseFloat(oklchMatch[2])),
      h: parseFloat(oklchMatch[3]),
      a: parseAlphaToken(oklchMatch[4]),
    });
  }

  const named = CSS_NAMED_COLORS[value.toLowerCase()];
  if (named) {
    return parseColor(named);
  }

  return null;
}

function parseAlphaToken(raw: string | undefined): number {
  if (raw === undefined) {
    return 1;
  }
  return raw.endsWith('%') ? clamp(parseFloat(raw) / 100) : clamp(parseFloat(raw));
}

function parseHex(hex: string): Rgba | null {
  if (hex.length === 3 || hex.length === 4) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
    return { r, g, b, a };
  }

  if (hex.length === 6 || hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  return null;
}

export function hueColor(h: number): string {
  return hsvaToHex({ h, s: 1, v: 1, a: 1 });
}

/** Relative luminance (WCAG), 0–1. */
export function relativeLuminance({ r, g, b }: Pick<Rgba, 'r' | 'g' | 'b'>): number {
  const R = srgbToLinear(r / 255);
  const G = srgbToLinear(g / 255);
  const B = srgbToLinear(b / 255);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Contrast ratio between two opaque colors (WCAG), 1–21. */
export function contrastRatio(foreground: Rgba, background: Rgba): number {
  const L1 = relativeLuminance(foreground);
  const L2 = relativeLuminance(background);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastLevel = {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
};

export function evaluateContrast(foreground: Rgba, background: Rgba): ContrastLevel {
  const ratio = contrastRatio(foreground, background);
  return {
    ratio: Math.round(ratio * 100) / 100,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

/** Apply optional channel locks to an HSVA color. */
export function applyColorLocks(hsva: Hsva, locks: ColorLockValues | null | undefined): Hsva {
  if (!locks) {
    return hsva;
  }
  return {
    h: locks.hue !== undefined ? clamp(locks.hue, 0, 360) : hsva.h,
    s: locks.saturation !== undefined ? clamp(locks.saturation) : hsva.s,
    v: locks.brightness !== undefined ? clamp(locks.brightness) : hsva.v,
    a: locks.alpha !== undefined ? clamp(locks.alpha) : hsva.a,
  };
}

export const DEFAULT_PRESETS = [
  '#0A0A0A',
  '#FAFAFA',
  '#E11D48',
  '#EA580C',
  '#CA8A04',
  '#16A34A',
  '#0891B2',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
] as const;
