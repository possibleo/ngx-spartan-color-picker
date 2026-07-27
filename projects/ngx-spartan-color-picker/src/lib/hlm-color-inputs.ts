import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import {
  ALL_COLOR_FORMATS,
  COLOR_FORMATS,
  ColorFormat,
  Hsla,
  Oklch,
  Rgba,
  clamp,
  parseColor,
  rgbaToHsla,
  rgbaToOklch,
} from './color-utils';
import { HlmColorCheckerboard } from './hlm-color-checkerboard';
import { HlmColorCopy } from './hlm-color-copy';
import { hlmStyle } from './spartan-style';

@Component({
  selector: 'hlm-color-inputs',
  imports: [NgTemplateOutlet, HlmColorCheckerboard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-2',
  },
  template: `
    <div class="flex items-center gap-2">
      <div [class]="previewClass()" aria-hidden="true">
        <hlm-color-checkerboard />
        <div class="absolute inset-0" [style.background]="preview()"></div>
      </div>

      @switch (format()) {
        @case ('hex') {
          <input
            [class]="inputClass()"
            type="text"
            spellcheck="false"
            autocomplete="off"
            aria-label="Hex or named color"
            [disabled]="disabled()"
            [value]="hexDraft()"
            (input)="onHexInput($event)"
            (blur)="commitHexDraft()"
            (keydown.enter)="commitHexDraft()"
          />
        }
        @case ('rgb') {
          <div class="grid w-full min-w-0 grid-cols-3 gap-1.5">
            <input
              [class]="channelClass()"
              type="number"
              min="0"
              max="255"
              aria-label="Red"
              [disabled]="disabled()"
              [value]="rgba().r"
              (input)="onRgbChannel('r', $event)"
            />
            <input
              [class]="channelClass()"
              type="number"
              min="0"
              max="255"
              aria-label="Green"
              [disabled]="disabled()"
              [value]="rgba().g"
              (input)="onRgbChannel('g', $event)"
            />
            <input
              [class]="channelClass()"
              type="number"
              min="0"
              max="255"
              aria-label="Blue"
              [disabled]="disabled()"
              [value]="rgba().b"
              (input)="onRgbChannel('b', $event)"
            />
          </div>
        }
        @case ('oklch') {
          <div class="grid w-full min-w-0 grid-cols-3 gap-1.5">
            <input
              [class]="channelClass()"
              type="number"
              min="0"
              max="1"
              step="0.01"
              aria-label="OKLCH lightness"
              [disabled]="disabled()"
              [value]="oklchDisplay().l"
              (input)="onOklchChannel('l', $event)"
            />
            <input
              [class]="channelClass()"
              type="number"
              min="0"
              max="0.4"
              step="0.01"
              aria-label="OKLCH chroma"
              [disabled]="disabled()"
              [value]="oklchDisplay().c"
              (input)="onOklchChannel('c', $event)"
            />
            <input
              [class]="channelClass()"
              type="number"
              min="0"
              max="360"
              step="1"
              aria-label="OKLCH hue"
              [disabled]="disabled()"
              [value]="oklchDisplay().h"
              (input)="onOklchChannel('h', $event)"
            />
          </div>
        }
        @default {
          <div class="grid w-full min-w-0 grid-cols-3 gap-1.5">
            <input
              [class]="channelClass()"
              type="number"
              min="0"
              max="360"
              aria-label="Hue"
              [disabled]="disabled()"
              [value]="hslaDisplay().h"
              (input)="onHslChannel('h', $event)"
            />
            <input
              [class]="channelClass()"
              type="number"
              min="0"
              max="100"
              aria-label="Saturation percent"
              [disabled]="disabled()"
              [value]="hslaDisplay().s"
              (input)="onHslChannel('s', $event)"
            />
            <input
              [class]="channelClass()"
              type="number"
              min="0"
              max="100"
              aria-label="Lightness percent"
              [disabled]="disabled()"
              [value]="hslaDisplay().l"
              (input)="onHslChannel('l', $event)"
            />
          </div>
        }
      }

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

    @if (resolvedFormats().length > 1) {
      <div [class]="formatGroupClass()" role="group" aria-label="Color output format">
        @for (option of resolvedFormats(); track option) {
          <button
            type="button"
            [class]="formatButtonClass(option)"
            [attr.aria-pressed]="format() === option"
            [disabled]="disabled()"
            (click)="format.set(option)"
          >
            {{ option }}
          </button>
        }
      </div>
    }
  `,
})
export class HlmColorInputs {
  readonly format = model<ColorFormat>('hex');
  readonly formats = input<readonly ColorFormat[]>(COLOR_FORMATS);

  readonly hex = input.required<string>();
  readonly rgba = input.required<Rgba>();
  readonly preview = input.required<string>();
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly copy = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly copyLabel = input('Copy');
  readonly copyAriaLabel = input('Copy color value');
  readonly copyTemplate = input<TemplateRef<unknown> | null>(null);

  readonly hexChange = output<string>();
  readonly rgbaChange = output<Rgba>();
  readonly hslaChange = output<Hsla>();
  readonly oklchChange = output<Oklch>();
  readonly copied = output<string>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly copySlot = contentChild(HlmColorCopy);
  private readonly _copyFeedback = signal(false);
  protected readonly copyFeedback = this._copyFeedback.asReadonly();

  private readonly _hexDraft = linkedSignal(() => this.hex());
  protected readonly hexDraft = this._hexDraft.asReadonly();

  protected readonly resolvedCopyTemplate = computed(
    () => this.copyTemplate() ?? this.copySlot()?.template ?? null,
  );

  protected readonly resolvedFormats = computed(() => {
    const allowed = new Set(ALL_COLOR_FORMATS);
    const list = this.formats().filter((format) => allowed.has(format));
    return list.length > 0 ? list : COLOR_FORMATS;
  });

  protected readonly hslaDisplay = computed(() => {
    const { h, s, l } = rgbaToHsla(this.rgba());
    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  });

  protected readonly oklchDisplay = computed(() => {
    const { l, c, h } = rgbaToOklch(this.rgba());
    return {
      l: Math.round(l * 1000) / 1000,
      c: Math.round(c * 1000) / 1000,
      h: Math.round(h * 10) / 10,
    };
  });

  protected readonly previewClass = computed(() =>
    hlmStyle(
      'spartan-color-surface',
      'relative size-9 shrink-0 overflow-hidden ring-1 ring-foreground/10',
    ),
  );

  protected readonly inputClass = computed(() =>
    hlmStyle('spartan-input', 'w-full min-w-0 outline-none'),
  );

  protected readonly channelClass = computed(() =>
    hlmStyle('spartan-input', 'w-full min-w-0 px-2 outline-none'),
  );

  protected readonly formatGroupClass = computed(() =>
    hlmStyle('spartan-color-surface', 'bg-muted/60 flex flex-wrap gap-0.5 p-0.5'),
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

  protected formatButtonClass(option: ColorFormat): string {
    const active = this.format() === option;
    return hlmStyle(
      'spartan-button',
      'spartan-button-size-xs',
      active ? 'spartan-button-variant-secondary' : 'spartan-button-variant-ghost',
      'flex-1 uppercase',
    );
  }

  protected async copyValue(): Promise<void> {
    if (this.disabled() || !isPlatformBrowser(this.platformId)) {
      return;
    }
    const value = this.preview();
    try {
      await navigator.clipboard.writeText(value);
      this._copyFeedback.set(true);
      this.copied.emit(value);
      window.setTimeout(() => this._copyFeedback.set(false), 1200);
    } catch {
      // Clipboard may be denied — ignore.
    }
  }

  protected onHexInput(event: Event): void {
    this._hexDraft.set((event.target as HTMLInputElement).value);
  }

  protected commitHexDraft(): void {
    const draft = this._hexDraft().trim();
    if (parseColor(draft)) {
      this.hexChange.emit(draft);
      return;
    }
    const withHash = draft.startsWith('#') ? draft : `#${draft}`;
    if (parseColor(withHash)) {
      this.hexChange.emit(withHash);
      return;
    }
    this._hexDraft.set(this.hex());
  }

  protected onRgbChannel(channel: 'r' | 'g' | 'b', event: Event): void {
    const next = clamp(numberAttribute((event.target as HTMLInputElement).value, 0), 0, 255);
    this.rgbaChange.emit({ ...this.rgba(), [channel]: next });
  }

  protected onHslChannel(channel: 'h' | 's' | 'l', event: Event): void {
    const current = rgbaToHsla(this.rgba());
    const raw = numberAttribute((event.target as HTMLInputElement).value, 0);

    const next: Hsla = {
      h: channel === 'h' ? clamp(raw, 0, 360) : current.h,
      s: channel === 's' ? clamp(raw / 100) : current.s,
      l: channel === 'l' ? clamp(raw / 100) : current.l,
      a: current.a,
    };
    this.hslaChange.emit(next);
  }

  protected onOklchChannel(channel: 'l' | 'c' | 'h', event: Event): void {
    const current = rgbaToOklch(this.rgba());
    const raw = numberAttribute((event.target as HTMLInputElement).value, 0);

    const next: Oklch = {
      l: channel === 'l' ? clamp(raw) : current.l,
      c: channel === 'c' ? Math.max(0, raw) : current.c,
      h: channel === 'h' ? clamp(raw, 0, 360) : current.h,
      a: current.a,
    };
    this.oklchChange.emit(next);
  }
}
