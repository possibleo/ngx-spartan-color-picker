import { DOCUMENT, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  COLOR_FORMATS,
  ColorFormat,
  ColorLockValues,
  ColorPickerLayout,
  ColorPickerPage,
  DEFAULT_PRESETS,
  Hsla,
  Hsva,
  Oklch,
  applyColorLocks,
  clamp,
  hsvaToCss,
  hsvaToHex,
  hsvaToRgba,
  hslaToRgba,
  hueColor,
  oklchToRgba,
  parseColor,
  rgbaToHsva,
} from './color-utils';
import { HlmColorContrast } from './hlm-color-contrast';
import { HlmColorCheckerboard } from './hlm-color-checkerboard';
import { HlmColorCopy } from './hlm-color-copy';
import { HlmColorEyedropper } from './hlm-color-eyedropper';
import { HlmColorInputs } from './hlm-color-inputs';
import { HlmColorPresets } from './hlm-color-presets';
import { HlmColorSlider } from './hlm-color-slider';
import { HlmColorSvArea } from './hlm-color-sv-area';
import { hlmStyle } from './spartan-style';

const FALLBACK_COLOR = '#2563EB';

declare global {
  interface Window {
    EyeDropper?: new () => {
      open: () => Promise<{ sRGBHex: string }>;
    };
  }
}

@Component({
  selector: 'hlm-color-picker-panel',
  imports: [
    NgTemplateOutlet,
    HlmColorCheckerboard,
    HlmColorSvArea,
    HlmColorSlider,
    HlmColorInputs,
    HlmColorPresets,
    HlmColorContrast,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex w-64 max-w-full flex-col gap-3 text-popover-foreground',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
  },
  template: `
    @if (layout() === 'pages' && resolvedPresets().length) {
      <div
        class="bg-muted/60 flex gap-0.5 rounded-[var(--radius)] p-0.5"
        role="tablist"
        aria-label="Color picker sections"
      >
        @for (tab of pageTabs; track tab.id) {
          <button
            type="button"
            role="tab"
            [id]="pageTabId(tab.id)"
            [class]="pageTabClass(tab.id)"
            [attr.aria-selected]="page() === tab.id"
            [attr.aria-controls]="pagePanelId(tab.id)"
            [attr.tabindex]="page() === tab.id ? 0 : -1"
            [disabled]="disabled()"
            (click)="page.set(tab.id)"
            (keydown)="onPageTabKeydown($event, tab.id)"
          >
            {{ tab.label }}
          </button>
        }
      </div>
    }

    @if (showPickerSection()) {
      <div
        [attr.role]="layout() === 'pages' ? 'tabpanel' : null"
        [attr.id]="layout() === 'pages' ? pagePanelId('picker') : null"
        [attr.aria-labelledby]="layout() === 'pages' ? pageTabId('picker') : null"
      >
      @if (eyedropper() && eyedropperSupported()) {
        <div class="flex justify-end">
          <button
            type="button"
            [attr.aria-label]="eyedropperAriaLabel()"
            [class]="eyedropperClass()"
            [disabled]="disabled() || eyedropperBusy()"
            (click)="pickFromScreen()"
          >
            @if (resolvedEyedropperTemplate(); as tpl) {
              <ng-container [ngTemplateOutlet]="tpl" />
            } @else {
              {{ eyedropperLabel() }}
            }
          </button>
        </div>
      }

      @if (showSvArea()) {
        <hlm-color-sv-area
          [hsva]="hsva()"
          [hueColor]="hueBackground()"
          [thumbColor]="opaqueHex()"
          [disabled]="disabled()"
          (hsvaChange)="patchHsva($event)"
        />
      }

      <div class="flex flex-col gap-2">
        @if (showHue()) {
          <hlm-color-slider
            kind="hue"
            label="Hue"
            [min]="0"
            [max]="360"
            [value]="hsva().h"
            [thumbColor]="hueBackground()"
            [disabled]="disabled()"
            (valueChange)="patchHsva({ h: $event })"
          />
        }

        @if (showSaturationSlider()) {
          <hlm-color-slider
            kind="neutral"
            label="Saturation"
            [min]="0"
            [max]="100"
            [value]="hsva().s * 100"
            [fillColor]="opaqueHex()"
            [thumbColor]="opaqueHex()"
            [disabled]="disabled()"
            (valueChange)="patchHsva({ s: toUnit($event) })"
          />
        }

        @if (showBrightnessSlider()) {
          <hlm-color-slider
            kind="neutral"
            label="Brightness"
            [min]="0"
            [max]="100"
            [value]="hsva().v * 100"
            [fillColor]="opaqueHex()"
            [thumbColor]="opaqueHex()"
            [disabled]="disabled()"
            (valueChange)="patchHsva({ v: toUnit($event) })"
          />
        }

        @if (showAlpha()) {
          <hlm-color-slider
            kind="alpha"
            label="Opacity"
            [min]="0"
            [max]="100"
            [value]="hsva().a * 100"
            [fillColor]="opaqueHex()"
            [thumbColor]="opaqueHex()"
            [disabled]="disabled()"
            (valueChange)="patchHsva({ a: clampAlpha($event) })"
          />
        }
      </div>

      @if (showInputs()) {
        <hlm-color-inputs
          [(format)]="format"
          [formats]="formats()"
          [hex]="opaqueHex()"
          [rgba]="rgba()"
          [preview]="cssValue()"
          [disabled]="disabled()"
          [copy]="copy()"
          [copyLabel]="copyLabel()"
          [copyAriaLabel]="copyAriaLabel()"
          [copyTemplate]="resolvedCopyTemplate()"
          (hexChange)="onHexChange($event)"
          (rgbaChange)="onRgbaChange($event)"
          (hslaChange)="onHslaChange($event)"
          (oklchChange)="onOklchChange($event)"
          (copied)="copied.emit($event)"
        />
      } @else if (showAlpha()) {
        <div class="flex items-center gap-2">
          <div [class]="lockedPreviewClass()" aria-hidden="true">
            <hlm-color-checkerboard />
            <div class="absolute inset-0" [style.background]="cssValue()"></div>
          </div>
          <code class="text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs">{{
            cssValue()
          }}</code>
          @if (copy()) {
            <button
              type="button"
              [class]="copyButtonClass()"
              [attr.aria-label]="copyFeedback() ? 'Copied' : copyAriaLabel()"
              [disabled]="disabled()"
              (click)="copyValue()"
            >
              @if (resolvedCopyTemplate(); as tpl) {
                <ng-container [ngTemplateOutlet]="tpl" />
              } @else {
                {{ copyFeedback() ? 'Copied' : copyLabel() }}
              }
            </button>
          }
        </div>
      }

      @if (contrastAgainst() !== null) {
        <hlm-color-contrast
          [foreground]="rgba()"
          [against]="contrastAgainst()!"
          [disabled]="disabled()"
          (againstChange)="contrastAgainst.set($event)"
        />
      }
      </div>
    }

    @if (showPresetsSection()) {
      <div
        [attr.role]="layout() === 'pages' ? 'tabpanel' : null"
        [attr.id]="layout() === 'pages' ? pagePanelId('presets') : null"
        [attr.aria-labelledby]="layout() === 'pages' ? pageTabId('presets') : null"
      >
        <hlm-color-presets
          [presets]="resolvedPresets()"
          [selected]="cssValue()"
          [disabled]="disabled()"
          (select)="selectPreset($event)"
        />
      </div>
    }

    @if (confirmation()) {
      <div class="flex gap-2 pt-1">
        <button
          type="button"
          [class]="cancelButtonClass()"
          [disabled]="disabled()"
          (click)="onDiscardClick()"
        >
          {{ cancelLabel() }}
        </button>
        <button
          type="button"
          [class]="applyButtonClass()"
          [disabled]="disabled()"
          (click)="apply()"
        >
          {{ acceptLabel() }}
        </button>
      </div>
    }
  `,
})
export class HlmColorPickerPanel {
  readonly value = model<string>(FALLBACK_COLOR);
  readonly format = model<ColorFormat>('hex');
  readonly formats = input<readonly ColorFormat[]>(COLOR_FORMATS);
  readonly page = model<ColorPickerPage>('picker');

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly alpha = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly confirmation = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly layout = input<ColorPickerLayout>('stack');
  readonly lockValues = input<ColorLockValues | null>(null);

  readonly eyedropper = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly eyedropperLabel = input('Eyedropper');
  readonly eyedropperAriaLabel = input('Pick color from screen');
  readonly eyedropperTemplate = input<TemplateRef<unknown> | null>(null);

  readonly copy = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly copyLabel = input('Copy');
  readonly copyAriaLabel = input('Copy color value');
  readonly copyTemplate = input<TemplateRef<unknown> | null>(null);

  readonly contrastAgainst = model<string | null>(null);
  readonly presets = input<readonly string[] | null>(DEFAULT_PRESETS);
  readonly ariaLabel = input('Color picker');
  readonly acceptLabel = input('Apply');
  readonly cancelLabel = input('Discard');

  /** Committed color after a user action (live edit or Apply). */
  readonly userChange = output<string>();
  /** Live draft while editing (especially with confirmation). */
  readonly draftChange = output<string>();
  /** Fired when Apply is pressed in confirmation mode. */
  readonly applied = output<string>();
  /** Fired when Discard is pressed in confirmation mode. */
  readonly discarded = output<void>();
  /** Fired after the current CSS value is copied to the clipboard. */
  readonly copied = output<string>();

  private readonly eyedropperSlot = contentChild(HlmColorEyedropper);
  private readonly copySlot = contentChild(HlmColorCopy);
  private readonly _copyFeedback = signal(false);
  protected readonly copyFeedback = this._copyFeedback.asReadonly();

  private readonly _hsva = linkedSignal(() => this.hsvaFromValue(this.value()));

  protected readonly hsva = this._hsva.asReadonly();
  protected readonly rgba = computed(() => hsvaToRgba(this._hsva()));
  protected readonly opaqueHex = computed(() => hsvaToHex({ ...this._hsva(), a: 1 }));
  protected readonly cssValue = computed(() =>
    hsvaToCss(this._hsva(), this.format(), this.alpha()),
  );
  protected readonly hueBackground = computed(() => hueColor(this._hsva().h));
  protected readonly resolvedPresets = computed(() => this.presets() ?? []);
  protected readonly resolvedEyedropperTemplate = computed(
    () => this.eyedropperTemplate() ?? this.eyedropperSlot()?.template ?? null,
  );
  protected readonly resolvedCopyTemplate = computed(
    () => this.copyTemplate() ?? this.copySlot()?.template ?? null,
  );

  protected readonly locks = computed(() => this.lockValues() ?? {});
  protected readonly showHue = computed(() => this.locks().hue === undefined);
  protected readonly showSvArea = computed(
    () => this.locks().saturation === undefined && this.locks().brightness === undefined,
  );
  protected readonly showSaturationSlider = computed(
    () => this.locks().saturation === undefined && this.locks().brightness !== undefined,
  );
  protected readonly showBrightnessSlider = computed(
    () => this.locks().brightness === undefined && this.locks().saturation !== undefined,
  );
  protected readonly showAlpha = computed(
    () => this.alpha() && this.locks().alpha === undefined,
  );
  protected readonly showInputs = computed(
    () =>
      this.locks().hue === undefined ||
      this.locks().saturation === undefined ||
      this.locks().brightness === undefined,
  );

  protected readonly showPickerSection = computed(
    () => this.layout() === 'stack' || this.page() === 'picker',
  );
  protected readonly showPresetsSection = computed(() => {
    if (!this.resolvedPresets().length) {
      return false;
    }
    return this.layout() === 'stack' || this.page() === 'presets';
  });

  readonly pageTabs = [
    { id: 'picker' as const, label: 'Picker' },
    { id: 'presets' as const, label: 'Presets' },
  ];

  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  protected readonly eyedropperSupported = computed(
    () => isPlatformBrowser(this.platformId) && typeof window.EyeDropper === 'function',
  );
  protected readonly eyedropperBusy = signal(false);

  protected readonly eyedropperClass = computed(() => {
    const iconOnly = !!this.resolvedEyedropperTemplate();
    return hlmStyle(
      'spartan-button',
      'spartan-button-variant-outline',
      iconOnly ? 'spartan-button-size-icon' : 'spartan-button-size-xs',
      iconOnly ? 'size-8' : null,
    );
  });

  protected readonly cancelButtonClass = computed(() =>
    hlmStyle(
      'spartan-button',
      'spartan-button-variant-outline',
      'spartan-button-size-sm',
      'flex-1',
    ),
  );

  protected readonly applyButtonClass = computed(() =>
    hlmStyle(
      'spartan-button',
      'spartan-button-variant-default',
      'spartan-button-size-sm',
      'flex-1',
    ),
  );

  protected readonly lockedPreviewClass = computed(() =>
    hlmStyle(
      'spartan-color-surface',
      'relative size-9 shrink-0 overflow-hidden ring-1 ring-foreground/10',
    ),
  );

  protected readonly copyButtonClass = computed(() => {
    const iconOnly = !!this.resolvedCopyTemplate();
    return hlmStyle(
      'spartan-button',
      'spartan-button-variant-outline',
      iconOnly ? 'spartan-button-size-icon' : 'spartan-button-size-xs',
      iconOnly ? 'size-8 shrink-0' : 'shrink-0 px-2',
    );
  });

  constructor() {
    effect(() => {
      const format = this.format();
      untracked(() => {
        if (this.confirmation()) {
          return;
        }
        const next = hsvaToCss(this._hsva(), format, this.alpha());
        if (next !== this.value()) {
          this.value.set(next);
        }
      });
    });
  }

  protected pageTabId(id: ColorPickerPage): string {
    return `hlm-color-picker-tab-${id}`;
  }

  protected pagePanelId(id: ColorPickerPage): string {
    return `hlm-color-picker-panel-${id}`;
  }

  protected pageTabClass(id: ColorPickerPage): string {
    const active = this.page() === id;
    return hlmStyle(
      'spartan-button',
      'spartan-button-size-xs',
      active ? 'spartan-button-variant-secondary' : 'spartan-button-variant-ghost',
      'flex-1',
    );
  }

  protected onPageTabKeydown(event: KeyboardEvent, id: ColorPickerPage): void {
    if (this.disabled() || this.layout() !== 'pages') {
      return;
    }

    const order = this.pageTabs.map((tab) => tab.id);
    const index = order.indexOf(id);
    if (index < 0) {
      return;
    }

    let nextIndex = index;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (index + 1) % order.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (index - 1 + order.length) % order.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = order.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const next = order[nextIndex]!;
    this.page.set(next);
    queueMicrotask(() => {
      this.document.getElementById(this.pageTabId(next))?.focus();
    });
  }

  protected clampAlpha(percent: number): number {
    return clamp(percent / 100);
  }

  protected toUnit(percent: number): number {
    return clamp(percent / 100);
  }

  /** Reset draft from the committed `value` (e.g. when the popover opens). */
  syncFromValue(): void {
    this._hsva.set(this.hsvaFromValue(this.value()));
    this.page.set('picker');
  }

  protected patchHsva(partial: Partial<Hsva>): void {
    if (this.disabled()) {
      return;
    }
    this.commitHsva({ ...this._hsva(), ...partial }, { user: true });
  }

  protected onHexChange(raw: string): void {
    const parsed = parseColor(raw) ?? parseColor(raw.startsWith('#') ? raw : `#${raw}`);
    if (!parsed) {
      return;
    }
    this.commitHsva(rgbaToHsva({ ...parsed, a: this.alpha() ? parsed.a : 1 }), { user: true });
  }

  protected onRgbaChange(rgba: ReturnType<typeof hsvaToRgba>): void {
    this.commitHsva(rgbaToHsva(rgba), { user: true });
  }

  protected onHslaChange(hsla: Hsla): void {
    this.commitHsva(rgbaToHsva(hslaToRgba(hsla)), { user: true });
  }

  protected onOklchChange(oklch: Oklch): void {
    this.commitHsva(rgbaToHsva(oklchToRgba(oklch)), { user: true });
  }

  protected selectPreset(preset: string): void {
    if (this.disabled()) {
      return;
    }
    const parsed = parseColor(preset);
    if (!parsed) {
      return;
    }
    this.commitHsva(rgbaToHsva({ ...parsed, a: this.alpha() ? parsed.a : 1 }), { user: true });
  }

  protected async pickFromScreen(): Promise<void> {
    if (this.disabled() || !window.EyeDropper) {
      return;
    }
    this.eyedropperBusy.set(true);
    try {
      const result = await new window.EyeDropper().open();
      const parsed = parseColor(result.sRGBHex);
      if (parsed) {
        this.commitHsva(rgbaToHsva({ ...parsed, a: this.alpha() ? parsed.a : 1 }), {
          user: true,
        });
      }
    } catch {
      // User cancelled EyeDropper — ignore.
    } finally {
      this.eyedropperBusy.set(false);
    }
  }

  protected apply(): void {
    if (this.disabled()) {
      return;
    }
    const next = this.cssValue();
    this.value.set(next);
    this.userChange.emit(next);
    this.applied.emit(next);
  }

  /** Discard button: always restores committed value and emits `discarded`. */
  protected onDiscardClick(): void {
    this.syncFromValue();
    this.discarded.emit();
  }

  /**
   * Popover dismiss / outside close: restore committed value.
   * Emits `discarded` only when the draft differed (so Apply-then-close is quiet).
   */
  dismissDraft(): void {
    const dirty = this.cssValue() !== this.value();
    this.syncFromValue();
    if (dirty) {
      this.discarded.emit();
    }
  }

  protected async copyValue(): Promise<void> {
    if (this.disabled() || !isPlatformBrowser(this.platformId)) {
      return;
    }
    const value = this.cssValue();
    try {
      await navigator.clipboard.writeText(value);
      this._copyFeedback.set(true);
      this.copied.emit(value);
      window.setTimeout(() => this._copyFeedback.set(false), 1200);
    } catch {
      // Clipboard may be denied — ignore.
    }
  }

  private hsvaFromValue(raw: string): Hsva {
    const parsed = parseColor(raw) ?? parseColor(FALLBACK_COLOR)!;
    return applyColorLocks(rgbaToHsva(parsed), this.lockValues());
  }

  private commitHsva(next: Hsva, options: { user: boolean }): void {
    const locks = this.lockValues();
    let normalized: Hsva = {
      h: clamp(next.h, 0, 360),
      s: clamp(next.s),
      v: clamp(next.v),
      a: this.alpha() ? clamp(next.a) : 1,
    };
    // Always honor explicit locks on user edits; clamp also forces picks onto locks.
    if (!this.alpha()) {
      normalized = { ...normalized, a: 1 };
    }
    if (options.user || locks?.clamp) {
      normalized = applyColorLocks(normalized, locks);
    }

    this._hsva.set(normalized);
    const css = hsvaToCss(normalized, this.format(), this.alpha());
    this.draftChange.emit(css);

    if (!this.confirmation()) {
      this.value.set(css);
      if (options.user) {
        this.userChange.emit(css);
      }
    }
  }
}
