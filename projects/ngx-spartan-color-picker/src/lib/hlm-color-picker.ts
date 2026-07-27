import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  forwardRef,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { BrnPopoverImports } from '@spartan-ng/brain/popover';
import {
  COLOR_FORMATS,
  ColorFormat,
  ColorLockValues,
  ColorPickerLayout,
  DEFAULT_PRESETS,
  hsvaToCss,
  parseColor,
  rgbaToHsva,
} from './color-utils';
import { HlmColorCheckerboard } from './hlm-color-checkerboard';
import { HlmColorCopy } from './hlm-color-copy';
import { HlmColorEyedropper } from './hlm-color-eyedropper';
import { HlmColorPickerPanel } from './hlm-color-picker-panel';
import { hlmStyle } from './spartan-style';

const FALLBACK_COLOR = '#2563EB';

export const HLM_COLOR_PICKER_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => HlmColorPicker),
  multi: true,
};

@Component({
  selector: 'hlm-color-picker',
  imports: [BrnPopoverImports, HlmColorPickerPanel, HlmColorCheckerboard],
  providers: [HLM_COLOR_PICKER_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex',
    '[attr.data-disabled]': 'disabledState() || null',
    '[class.cursor-not-allowed]': 'disabledState()',
    '[class.opacity-50]': 'disabledState()',
  },
  template: `
    <brn-popover
      align="start"
      [sideOffset]="8"
      [state]="popoverState()"
      (stateChanged)="onPopoverState($event)"
    >
      <button
        type="button"
        brnPopoverTrigger
        [class]="triggerClass()"
        [disabled]="disabledState()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-expanded]="popoverOpen()"
        [attr.aria-haspopup]="'dialog'"
      >
        <hlm-color-checkerboard />
        <span class="absolute inset-0" aria-hidden="true" [style.background]="swatchColor()"></span>
      </button>

      <ng-template brnPopoverContent>
        <div
          [class]="contentClass()"
          role="dialog"
          [attr.aria-label]="ariaLabel()"
        >
          <hlm-color-picker-panel
            [(value)]="value"
            [(format)]="format"
            [formats]="formats()"
            [disabled]="disabledState()"
            [alpha]="alpha()"
            [confirmation]="confirmation()"
            [layout]="layout()"
            [lockValues]="lockValues()"
            [acceptLabel]="acceptLabel()"
            [cancelLabel]="cancelLabel()"
            [eyedropper]="eyedropper()"
            [eyedropperLabel]="eyedropperLabel()"
            [eyedropperAriaLabel]="eyedropperAriaLabel()"
            [eyedropperTemplate]="eyedropperSlot()?.template ?? null"
            [copy]="copy()"
            [copyLabel]="copyLabel()"
            [copyAriaLabel]="copyAriaLabel()"
            [copyTemplate]="copySlot()?.template ?? null"
            [(contrastAgainst)]="contrastAgainst"
            [presets]="presets()"
            [ariaLabel]="ariaLabel()"
            (userChange)="userChange.emit($event)"
            (draftChange)="draftChange.emit($event)"
            (copied)="copied.emit($event)"
            (applied)="onApplied($event)"
            (discarded)="onDiscarded()"
          />
        </div>
      </ng-template>
    </brn-popover>
  `,
})
export class HlmColorPicker implements ControlValueAccessor, FormValueControl<string> {
  readonly value = model<string>(FALLBACK_COLOR);
  readonly format = model<ColorFormat>('hex');
  readonly formats = input<readonly ColorFormat[]>(COLOR_FORMATS);

  readonly disabled = input(false, {
    transform: (value: unknown) => booleanAttribute(value),
  });
  readonly alpha = input(false, {
    transform: (value: unknown) => booleanAttribute(value),
  });
  readonly confirmation = input(false, {
    transform: (value: unknown) => booleanAttribute(value),
  });
  readonly layout = input<ColorPickerLayout>('stack');
  readonly lockValues = input<ColorLockValues | null>(null);
  readonly acceptLabel = input('Apply');
  readonly cancelLabel = input('Discard');

  readonly eyedropper = input(false, {
    transform: (value: unknown) => booleanAttribute(value),
  });
  readonly eyedropperLabel = input('Eyedropper');
  readonly eyedropperAriaLabel = input('Pick color from screen');
  readonly copy = input(false, {
    transform: (value: unknown) => booleanAttribute(value),
  });
  readonly copyLabel = input('Copy');
  readonly copyAriaLabel = input('Copy color value');
  readonly contrastAgainst = model<string | null>(null);
  readonly presets = input<readonly string[] | null>(DEFAULT_PRESETS);
  readonly ariaLabel = input('Choose color');

  readonly touch = output<void>();
  readonly userChange = output<string>();
  readonly draftChange = output<string>();
  readonly copied = output<string>();
  readonly open = output<void>();
  readonly close = output<void>();

  protected readonly eyedropperSlot = contentChild(HlmColorEyedropper);
  protected readonly copySlot = contentChild(HlmColorCopy);
  private readonly panel = viewChild(HlmColorPickerPanel);

  private readonly _disabled = linkedSignal(this.disabled);
  protected readonly disabledState = this._disabled.asReadonly();

  private readonly _popoverState = signal<'open' | 'closed'>('closed');
  protected readonly popoverState = this._popoverState.asReadonly();
  protected readonly popoverOpen = computed(() => this._popoverState() === 'open');

  protected readonly triggerClass = computed(() =>
    hlmStyle(
      'spartan-button',
      'spartan-button-variant-outline',
      'spartan-button-size-icon',
      'relative overflow-hidden',
      'disabled:pointer-events-none',
    ),
  );

  protected readonly contentClass = computed(() =>
    hlmStyle('spartan-popover-content', 'relative w-auto outline-none'),
  );

  protected readonly swatchColor = computed(() => {
    const current = this.value();
    return parseColor(current) ? current : FALLBACK_COLOR;
  });

  private _onChange?: (value: string) => void;
  private _onTouched?: () => void;
  private _lastEmitted = FALLBACK_COLOR;

  constructor() {
    effect(() => {
      const next = this.value();
      untracked(() => {
        if (next === this._lastEmitted) {
          return;
        }
        this._lastEmitted = next;
        this._onChange?.(next);
      });
    });

    effect(() => {
      const format = this.format();
      untracked(() => {
        if (this.confirmation()) {
          return;
        }
        const parsed = parseColor(this.value());
        if (!parsed) {
          return;
        }
        const next = hsvaToCss(rgbaToHsva(parsed), format, this.alpha());
        if (next !== this.value()) {
          this.value.set(next);
        }
      });
    });

    effect(() => {
      if (!this.popoverOpen()) {
        return;
      }
      untracked(() => {
        queueMicrotask(() => this.panel()?.syncFromValue());
      });
    });
  }

  protected onPopoverState(state: 'open' | 'closed'): void {
    this._popoverState.set(state);
    if (state === 'open') {
      this.open.emit();
      return;
    }

    if (this.confirmation()) {
      this.panel()?.dismissDraft();
    }
    this.close.emit();
    this.touch.emit();
    this._onTouched?.();
  }

  protected onApplied(_color: string): void {
    this._popoverState.set('closed');
  }

  protected onDiscarded(): void {
    this._popoverState.set('closed');
  }

  writeValue(value: string | null): void {
    const next = value && value.length > 0 && parseColor(value) ? value : FALLBACK_COLOR;
    this._lastEmitted = next;
    this.value.set(next);
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }
}
