/*
 * Public API Surface of ngx-spartan-color-picker
 */

export {
  ALL_COLOR_FORMATS,
  COLOR_FORMATS,
  DEFAULT_PRESETS,
  applyColorLocks,
  clamp,
  contrastRatio,
  evaluateContrast,
  hsvaToCss,
  hsvaToHex,
  hsvaToRgba,
  hslaToRgba,
  hueColor,
  oklchToRgba,
  parseColor,
  relativeLuminance,
  rgbaToCss,
  rgbaToHex,
  rgbaToHsla,
  rgbaToHsva,
  rgbaToOklch,
} from './lib/color-utils';
export type {
  ColorFormat,
  ColorLockValues,
  ColorPickerLayout,
  ColorPickerPage,
  ContrastLevel,
  Hsla,
  Hsva,
  Oklch,
  Rgba,
} from './lib/color-utils';

export { HLM_COLOR_PICKER_VALUE_ACCESSOR, HlmColorPicker } from './lib/hlm-color-picker';
export { HlmColorPickerPanel } from './lib/hlm-color-picker-panel';
export { HlmColorEyedropper } from './lib/hlm-color-eyedropper';
export { HlmColorCopy } from './lib/hlm-color-copy';
export { HlmColorSvArea } from './lib/hlm-color-sv-area';
export { HlmColorSlider } from './lib/hlm-color-slider';
export type { HlmColorSliderKind } from './lib/hlm-color-slider';
export { HlmColorInputs } from './lib/hlm-color-inputs';
export { HlmColorPresets } from './lib/hlm-color-presets';
export { HlmColorCheckerboard } from './lib/hlm-color-checkerboard';
export { HlmColorContrast } from './lib/hlm-color-contrast';

export {
  expandSpartanClasses,
  hlmStyle,
  styleClass,
  SPARTAN_STYLE_IDS,
} from './lib/spartan-style';
export type { SpartanStyleId } from './lib/spartan-style';

import { HlmColorCopy } from './lib/hlm-color-copy';
import { HlmColorEyedropper } from './lib/hlm-color-eyedropper';
import { HlmColorPicker } from './lib/hlm-color-picker';
import { HlmColorPickerPanel } from './lib/hlm-color-picker-panel';

/** Convenience imports for the public picker surface (trigger, panel, icon slots). */
export const HlmColorPickerImports = [
  HlmColorPicker,
  HlmColorPickerPanel,
  HlmColorEyedropper,
  HlmColorCopy,
] as const;
