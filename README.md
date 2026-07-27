# ngx-spartan-color-picker

An Angular color picker for [Spartan NG](https://spartan.ng) apps.

It matches your existing Spartan theme automatically, works in popovers or as an inline panel, and is aimed at settings and theme controls — not full design tools.

This is a community package (MIT). It is not an official Spartan product.

| | |
| --- | --- |
| **Package** | [`ngx-spartan-color-picker`](https://www.npmjs.com/package/ngx-spartan-color-picker) |
| **Docs & demos** | [possibleo.github.io/ngx-spartan-color-picker](https://possibleo.github.io/ngx-spartan-color-picker/) |
| **Repository** | [github.com/possibleo/ngx-spartan-color-picker](https://github.com/possibleo/ngx-spartan-color-picker) |

## Requirements

Your app should already have:

- **Angular 19+**
- **Angular 21+** if you use Signal Forms (`[formField]`)
- **`@spartan-ng/brain` 1.x**
- **Tailwind CSS v4** with a Spartan theme set up

See the [Spartan installation guide](https://spartan.ng/documentation/installation) if you need the theme first.

## Install

```bash
npm i ngx-spartan-color-picker
```

```bash
yarn add ngx-spartan-color-picker
```

```bash
pnpm add ngx-spartan-color-picker
```

```ts
import { HlmColorPickerImports } from 'ngx-spartan-color-picker';
```

## Quick start

### Popover swatch

```html
<hlm-color-picker [(value)]="color" [alpha]="true" />
```

### Signal Forms (Angular 21+)

```ts
import { signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { HlmColorPickerImports } from 'ngx-spartan-color-picker';

@Component({
  imports: [FormField, HlmColorPickerImports],
  template: `
    <hlm-color-picker [formField]="themeForm.color" ariaLabel="Theme color" />
  `,
})
export class ThemeSettings {
  themeModel = signal({ color: '#16A34A' });
  themeForm = form(this.themeModel);
}
```

### Inline panel

```html
<hlm-color-picker-panel
  [(value)]="color"
  [(format)]="format"
  [formats]="['hex', 'rgb', 'hsl', 'oklch']"
  [alpha]="true"
/>
```

Reactive forms are supported as well (`ControlValueAccessor`).

## What you can do

| Feature | Usage |
| --- | --- |
| Color formats | `hex`, `rgb`, `hsl`, and optional `oklch` |
| Opacity | `[alpha]="true"` |
| Apply / discard | `[confirmation]="true"` |
| Compact layout | `layout="pages"` |
| Lock channels | `[lockValues]="…"` (e.g. opacity-only brand color) |
| Eyedropper | `[eyedropper]="true"` |
| Copy value | `[copy]="true"` |
| Contrast check | `[(contrastAgainst)]="background"` |
| Presets | included by default; `[presets]="null"` to hide |

The bound `value` is always a CSS color string. Change `format` to rewrite it as hex, rgb, hsl, or oklch.

## Theming

No style config. The picker uses your app’s Spartan theme tokens and `--radius`, so it follows whatever style you already use (Nova, Vega, and so on).

## Development

```bash
npm install
npm start              # docs site
npm test               # unit tests
npm run build:lib      # library build
npm run build:site     # docs site build
```

- Library: `projects/ngx-spartan-color-picker`
- Docs site: `projects/site`

## License

MIT
