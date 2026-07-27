import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import {
  ALL_COLOR_FORMATS,
  DEFAULT_PRESETS,
  HlmColorCopy,
  HlmColorEyedropper,
  HlmColorPicker,
  HlmColorPickerPanel,
  type ColorFormat,
  type ColorLockValues,
  type ColorPickerLayout,
} from 'ngx-spartan-color-picker';

type DisplayMode = 'popover' | 'panel';
type FeatureKey =
  | 'alpha'
  | 'confirmation'
  | 'eyedropper'
  | 'copy'
  | 'contrast'
  | 'presets'
  | 'lockOpacity'
  | 'disabled';

@Component({
  selector: 'playground-page',
  imports: [
    RouterLink,
    NgIcon,
    HlmColorCopy,
    HlmColorEyedropper,
    HlmColorPicker,
    HlmColorPickerPanel,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
    style: 'accent-color: var(--color-primary, var(--primary));',
  },
  template: `
    <div class="site-container pb-24 pt-10 lg:pt-14">
      <div class="min-w-0 max-w-2xl">
        <p class="site-kicker">
          <a routerLink="/" class="hover:text-foreground transition-colors">Home</a>
          <span class="mx-2 text-border" aria-hidden="true">/</span>
          Playground
        </p>
        <h1 id="playground-heading" class="site-heading mt-2">Playground</h1>
        <p class="site-lead text-base">
          Toggle options and see the picker update live. The snippet below mirrors your
          current setup — copy it into a Spartan app.
        </p>
      </div>

      <div class="mt-10 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-10">
        <fieldset class="site-card m-0 min-w-0 self-start border-0 p-4 shadow-sm sm:p-5">
          <legend class="visually-hidden">Playground options</legend>
          <p class="mb-4 text-sm font-medium" aria-hidden="true">Options</p>

          <div class="space-y-5">
            <div>
              <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                Display
              </p>
              <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Display mode">
                @for (mode of displayModes; track mode.id) {
                  <label
                    class="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-[:checked]:border-foreground/30 has-[:checked]:bg-muted"
                  >
                    <input
                      type="radio"
                      class="size-3.5"
                      name="display-mode"
                      [value]="mode.id"
                      [checked]="display() === mode.id"
                      (change)="display.set(mode.id)"
                    />
                    {{ mode.label }}
                  </label>
                }
              </div>
            </div>

            <div>
              <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                Features
              </p>
              <ul class="m-0 flex list-none flex-col gap-2 p-0">
                @for (opt of featureOptions; track opt.key) {
                  <li>
                    <label class="flex cursor-pointer items-start gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        class="mt-0.5 size-3.5 shrink-0"
                        [checked]="features()[opt.key]"
                        (change)="toggleFeature(opt.key, $event)"
                      />
                      <span>
                        <span class="font-medium">{{ opt.label }}</span>
                        <span class="text-muted-foreground block text-xs leading-snug">
                          {{ opt.hint }}
                        </span>
                      </span>
                    </label>
                  </li>
                }
              </ul>
            </div>

            <div>
              <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                Layout
              </p>
              <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Panel layout">
                @for (tab of layoutOptions; track tab.id) {
                  <label
                    class="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-[:checked]:border-foreground/30 has-[:checked]:bg-muted"
                  >
                    <input
                      type="radio"
                      class="size-3.5"
                      name="layout"
                      [value]="tab.id"
                      [checked]="layout() === tab.id"
                      (change)="layout.set(tab.id)"
                    />
                    {{ tab.label }}
                  </label>
                }
              </div>
            </div>

            <div>
              <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                Formats
              </p>
              <ul class="m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0">
                @for (fmt of allFormats; track fmt) {
                  <li>
                    <label class="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        class="size-3.5"
                        [checked]="formatEnabled()[fmt]"
                        [disabled]="isSoleFormat(fmt)"
                        (change)="toggleFormat(fmt, $event)"
                      />
                      {{ fmt }}
                    </label>
                  </li>
                }
              </ul>
              <label class="mt-3 flex flex-col gap-1.5 text-sm">
                <span class="text-muted-foreground text-xs">Active format</span>
                <select
                  class="border-border bg-background focus-visible:ring-ring rounded-md border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2"
                  [value]="format()"
                  (change)="onActiveFormat($event)"
                >
                  @for (fmt of enabledFormats(); track fmt) {
                    <option [value]="fmt">{{ fmt }}</option>
                  }
                </select>
              </label>
            </div>
          </div>
        </fieldset>

        <div class="min-w-0 space-y-6">
          <div class="site-card">
            <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 class="text-sm font-medium">Preview</h2>
                <p class="text-muted-foreground mt-0.5 text-sm">
                  Value
                  <code class="site-inline-code text-xs break-all">{{ color() }}</code>
                </p>
              </div>
              @if (lastCopied()) {
                <p class="text-muted-foreground text-xs" role="status">
                  Copied
                  <code class="site-inline-code">{{ lastCopied() }}</code>
                </p>
              }
            </div>

            @if (display() === 'popover') {
              <div class="flex items-center gap-3">
                <hlm-color-picker
                  [(value)]="color"
                  [(format)]="format"
                  [formats]="enabledFormats()"
                  [alpha]="features().alpha"
                  [confirmation]="features().confirmation"
                  [disabled]="features().disabled"
                  [layout]="layout()"
                  [eyedropper]="features().eyedropper"
                  [copy]="features().copy"
                  [lockValues]="lockValues()"
                  [presets]="presets()"
                  [(contrastAgainst)]="contrastAgainst"
                  (copied)="lastCopied.set($event)"
                >
                  @if (features().eyedropper) {
                    <ng-template hlmColorEyedropper>
                      <ng-icon name="lucidePipette" size="16" />
                    </ng-template>
                  }
                  @if (features().copy) {
                    <ng-template hlmColorCopy>
                      <ng-icon name="lucideCopy" size="14" />
                    </ng-template>
                  }
                </hlm-color-picker>
                <span class="text-muted-foreground text-sm">Open the swatch to edit</span>
              </div>
            } @else {
              <div class="w-full max-w-64">
                <hlm-color-picker-panel
                  [(value)]="color"
                  [(format)]="format"
                  [formats]="enabledFormats()"
                  [alpha]="features().alpha"
                  [confirmation]="features().confirmation"
                  [disabled]="features().disabled"
                  [layout]="layout()"
                  [eyedropper]="features().eyedropper"
                  [copy]="features().copy"
                  [lockValues]="lockValues()"
                  [presets]="presets()"
                  [(contrastAgainst)]="contrastAgainst"
                  (copied)="lastCopied.set($event)"
                >
                  @if (features().eyedropper) {
                    <ng-template hlmColorEyedropper>
                      <ng-icon name="lucidePipette" size="16" />
                    </ng-template>
                  }
                  @if (features().copy) {
                    <ng-template hlmColorCopy>
                      <ng-icon name="lucideCopy" size="14" />
                    </ng-template>
                  }
                </hlm-color-picker-panel>
              </div>
            }
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between gap-3">
              <h2 class="text-sm font-medium">Generated snippet</h2>
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
                (click)="copySnippet()"
              >
                {{ snippetCopied() ? 'Copied' : 'Copy' }}
              </button>
            </div>
            <pre
              class="site-code-block mt-0 overflow-x-auto text-xs"
              tabindex="0"
            ><code>{{ snippet() }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PlaygroundPage {
  readonly displayModes = [
    { id: 'popover' as const, label: 'Popover' },
    { id: 'panel' as const, label: 'Inline panel' },
  ];

  readonly layoutOptions = [
    { id: 'stack' as const, label: 'Stack' },
    { id: 'pages' as const, label: 'Pages' },
  ];

  readonly featureOptions: readonly { key: FeatureKey; label: string; hint: string }[] = [
    { key: 'alpha', label: 'Alpha', hint: 'Opacity slider + alpha in output' },
    { key: 'confirmation', label: 'Confirmation', hint: 'Apply / Discard draft workflow' },
    { key: 'eyedropper', label: 'Eyedropper', hint: 'Desktop Chrome/Edge only' },
    { key: 'copy', label: 'Copy', hint: 'Clipboard button + (copied) event' },
    { key: 'contrast', label: 'Contrast', hint: 'WCAG checks vs an editable color' },
    { key: 'presets', label: 'Presets', hint: 'Show the default swatch row' },
    {
      key: 'lockOpacity',
      label: 'Lock hue / S / B',
      hint: 'Opacity-only brand color (clamp)',
    },
    { key: 'disabled', label: 'Disabled', hint: 'Non-interactive chrome' },
  ];

  readonly allFormats = ALL_COLOR_FORMATS;

  readonly display = signal<DisplayMode>('panel');
  readonly layout = signal<ColorPickerLayout>('stack');
  readonly color = signal('#2563EB');
  readonly format = signal<ColorFormat>('hex');
  readonly lastCopied = signal<string | null>(null);
  readonly snippetCopied = signal(false);

  readonly features = signal<Record<FeatureKey, boolean>>({
    alpha: true,
    confirmation: false,
    eyedropper: true,
    copy: false,
    contrast: false,
    presets: true,
    lockOpacity: false,
    disabled: false,
  });

  readonly formatEnabled = signal<Record<ColorFormat, boolean>>({
    hex: true,
    rgb: true,
    hsl: true,
    oklch: false,
  });

  readonly contrastAgainst = signal<string | null>(null);

  readonly enabledFormats = computed(() =>
    this.allFormats.filter((fmt) => this.formatEnabled()[fmt]),
  );

  readonly presets = computed(() => (this.features().presets ? DEFAULT_PRESETS : null));

  readonly lockValues = computed((): ColorLockValues | null => {
    if (!this.features().lockOpacity) {
      return null;
    }
    return {
      hue: 217,
      saturation: 0.91,
      brightness: 0.92,
      clamp: true,
    };
  });

  readonly snippet = computed(() => {
    const tag = this.display() === 'popover' ? 'hlm-color-picker' : 'hlm-color-picker-panel';
    const f = this.features();
    const formats = this.enabledFormats();
    const isDefaultFormats =
      formats.length === 3 &&
      formats.includes('hex') &&
      formats.includes('rgb') &&
      formats.includes('hsl') &&
      !formats.includes('oklch');

    const attrs: string[] = [`[(value)]="color"`];

    if (this.format() !== 'hex' || !isDefaultFormats) {
      attrs.push(`[(format)]="format"`);
    }
    if (!isDefaultFormats) {
      attrs.push(`[formats]="[${formats.map((x) => `'${x}'`).join(', ')}]"`);
    }
    if (f.alpha) {
      attrs.push(`[alpha]="true"`);
    }
    if (f.confirmation) {
      attrs.push(`[confirmation]="true"`);
    }
    if (f.disabled) {
      attrs.push(`[disabled]="true"`);
    }
    if (this.layout() !== 'stack') {
      attrs.push(`layout="pages"`);
    }
    if (f.eyedropper) {
      attrs.push(`[eyedropper]="true"`);
    }
    if (f.copy) {
      attrs.push(`[copy]="true"`);
    }
    if (f.contrast) {
      attrs.push(`[(contrastAgainst)]="contrastBg"`);
    }
    if (f.lockOpacity) {
      attrs.push(
        `[lockValues]="{ hue: 217, saturation: 0.91, brightness: 0.92, clamp: true }"`,
      );
    }
    if (!f.presets) {
      attrs.push(`[presets]="null"`);
    }

    const hasProjection = f.eyedropper || f.copy;
    if (!hasProjection && attrs.length === 1) {
      return `<${tag} ${attrs[0]} />`;
    }

    const open = `<${tag}\n${attrs.map((a) => `  ${a}`).join('\n')}`;
    if (!hasProjection) {
      return `${open} />`;
    }

    const children: string[] = [];
    if (f.eyedropper) {
      children.push(`  <ng-template hlmColorEyedropper>…</ng-template>`);
    }
    if (f.copy) {
      children.push(`  <ng-template hlmColorCopy>…</ng-template>`);
    }
    return `${open}>\n${children.join('\n')}\n</${tag}>`;
  });

  toggleFeature(key: FeatureKey, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.features.update((current) => ({ ...current, [key]: checked }));

    if (key === 'contrast') {
      this.contrastAgainst.set(checked ? '#ffffff' : null);
    }
  }

  toggleFormat(fmt: ColorFormat, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (!checked && this.isSoleFormat(fmt)) {
      return;
    }
    this.formatEnabled.update((current) => ({ ...current, [fmt]: checked }));
    const enabled = this.enabledFormats();
    if (!enabled.includes(this.format())) {
      this.format.set(enabled[0] ?? 'hex');
    }
  }

  isSoleFormat(fmt: ColorFormat): boolean {
    const enabled = this.enabledFormats();
    return enabled.length === 1 && enabled[0] === fmt;
  }

  onActiveFormat(event: Event): void {
    this.format.set((event.target as HTMLSelectElement).value as ColorFormat);
  }

  async copySnippet(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.snippet());
      this.snippetCopied.set(true);
      window.setTimeout(() => this.snippetCopied.set(false), 1600);
    } catch {
      this.snippetCopied.set(false);
    }
  }
}
