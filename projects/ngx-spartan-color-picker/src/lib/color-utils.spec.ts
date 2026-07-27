import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  evaluateContrast,
  applyColorLocks,
  hsvaToRgba,
  hslaToRgba,
  oklchToRgba,
  parseColor,
  rgbaToHex,
  rgbaToHsla,
  rgbaToHsva,
  rgbaToOklch,
  rgbaToCss,
} from './color-utils';

describe('color-utils', () => {
  it('round-trips rgb through hsv', () => {
    const rgba = { r: 37, g: 99, b: 235, a: 1 };
    const back = hsvaToRgba(rgbaToHsva(rgba));
    expect(back).toEqual(rgba);
  });

  it('round-trips rgb through hsl', () => {
    const rgba = { r: 37, g: 99, b: 235, a: 1 };
    const back = hslaToRgba(rgbaToHsla(rgba));
    expect(back.r).toBeCloseTo(rgba.r, 0);
    expect(back.g).toBeCloseTo(rgba.g, 0);
    expect(back.b).toBeCloseTo(rgba.b, 0);
  });

  it('round-trips rgb through oklch', () => {
    const rgba = { r: 37, g: 99, b: 235, a: 1 };
    const back = oklchToRgba(rgbaToOklch(rgba));
    expect(back.r).toBeCloseTo(rgba.r, 0);
    expect(back.g).toBeCloseTo(rgba.g, 0);
    expect(back.b).toBeCloseTo(rgba.b, 0);
  });

  it('parses hex, rgb, hsl, oklch, and named colors', () => {
    expect(parseColor('#00ff00')).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
    expect(parseColor('hsl(120, 100%, 50%)')).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    expect(parseColor('red')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor('rebeccapurple')).toEqual({ r: 102, g: 51, b: 153, a: 1 });

    const fromOklch = parseColor('oklch(0.628 0.258 29.2)');
    expect(fromOklch).not.toBeNull();
    expect(fromOklch!.r).toBeGreaterThan(200);
    expect(fromOklch!.g).toBeLessThan(80);
  });

  it('formats hex, rgb, hsl, and oklch outputs', () => {
    const red = { r: 255, g: 0, b: 0, a: 0.5 };
    expect(rgbaToHex(red, true)).toBe('#FF000080');
    expect(rgbaToCss(red, 'rgb', true)).toBe('rgba(255, 0, 0, 0.5)');
    expect(rgbaToCss({ r: 255, g: 0, b: 0, a: 1 }, 'hsl')).toBe('hsl(0, 100%, 50%)');
    expect(rgbaToCss({ r: 255, g: 0, b: 0, a: 1 }, 'oklch')).toMatch(/^oklch\(/);
  });

  it('evaluates WCAG contrast', () => {
    const black = { r: 0, g: 0, b: 0, a: 1 };
    const white = { r: 255, g: 255, b: 255, a: 1 };
    expect(contrastRatio(black, white)).toBeCloseTo(21, 0);
    const report = evaluateContrast(black, white);
    expect(report.aaNormal).toBe(true);
    expect(report.aaaNormal).toBe(true);
  });

  it('applies channel locks', () => {
    const locked = applyColorLocks(
      { h: 10, s: 1, v: 1, a: 0.2 },
      { hue: 210, saturation: 0.5, brightness: 0.8, clamp: true },
    );
    expect(locked.h).toBe(210);
    expect(locked.s).toBe(0.5);
    expect(locked.v).toBe(0.8);
    expect(locked.a).toBe(0.2);
  });
});
