import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { Rgba, evaluateContrast, parseColor, rgbaToHex } from './color-utils';
import { hlmStyle } from './spartan-style';

/**
 * Optional WCAG contrast readout. The background (“vs”) color is editable.
 * Enable via a non-null `contrastAgainst` on the panel.
 */
@Component({
  selector: 'hlm-color-contrast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'text-muted-foreground block text-xs',
    role: 'status',
  },
  template: `
    <div class="flex flex-col gap-2">
      <label class="flex flex-wrap items-center gap-2">
        <span class="shrink-0">Contrast vs</span>
        <span
          class="relative size-5 shrink-0 overflow-hidden ring-1 ring-foreground/10"
          [class]="swatchClass()"
          [style.background]="againstPreview()"
          aria-hidden="true"
        ></span>
        <input
          type="text"
          spellcheck="false"
          autocomplete="off"
          aria-label="Contrast background color"
          [class]="inputClass()"
          [value]="draft()"
          [disabled]="disabled()"
          (input)="onDraftInput($event)"
          (blur)="commitDraft()"
          (keydown.enter)="commitDraft()"
        />
      </label>

      @if (report(); as info) {
        <p class="m-0 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            <span class="text-foreground font-medium tabular-nums">{{ info.ratio }}:1</span>
          </span>
          <span class="flex flex-wrap gap-1">
            <span
              class="rounded px-1.5 py-0.5 font-medium"
              [class.bg-primary/15]="info.aaNormal"
              [class.text-foreground]="info.aaNormal"
              [class.bg-muted]="!info.aaNormal"
            >
              AA {{ info.aaNormal ? 'pass' : 'fail' }}
            </span>
            <span
              class="rounded px-1.5 py-0.5 font-medium"
              [class.bg-primary/15]="info.aaLarge"
              [class.text-foreground]="info.aaLarge"
              [class.bg-muted]="!info.aaLarge"
            >
              AA large {{ info.aaLarge ? 'pass' : 'fail' }}
            </span>
            <span
              class="rounded px-1.5 py-0.5 font-medium"
              [class.bg-primary/15]="info.aaaNormal"
              [class.text-foreground]="info.aaaNormal"
              [class.bg-muted]="!info.aaaNormal"
            >
              AAA {{ info.aaaNormal ? 'pass' : 'fail' }}
            </span>
            <span
              class="rounded px-1.5 py-0.5 font-medium"
              [class.bg-primary/15]="info.aaaLarge"
              [class.text-foreground]="info.aaaLarge"
              [class.bg-muted]="!info.aaaLarge"
            >
              AAA large {{ info.aaaLarge ? 'pass' : 'fail' }}
            </span>
          </span>
        </p>
      } @else {
        <p class="m-0">Enter a valid CSS color to check contrast.</p>
      }
    </div>
  `,
})
export class HlmColorContrast {
  readonly foreground = input.required<Rgba>();
  /** CSS color string checked as the background (two-way). */
  readonly against = model.required<string>();
  readonly disabled = input(false);

  private readonly _draft = linkedSignal(() => this.against());
  protected readonly draft = this._draft.asReadonly();

  protected readonly againstPreview = computed(() => {
    const parsed = parseColor(this.against());
    return parsed ? rgbaToHex(parsed, false) : 'transparent';
  });

  protected readonly report = computed(() => {
    const bg = parseColor(this.against());
    if (!bg) {
      return null;
    }
    return evaluateContrast(this.foreground(), { ...bg, a: 1 });
  });

  protected readonly inputClass = computed(() =>
    hlmStyle('spartan-input', 'min-w-0 flex-1 font-mono text-[0.7rem] outline-none'),
  );

  protected readonly swatchClass = computed(() => hlmStyle('spartan-color-surface'));

  protected onDraftInput(event: Event): void {
    this._draft.set((event.target as HTMLInputElement).value);
  }

  protected commitDraft(): void {
    const raw = this._draft().trim();
    const parsed = parseColor(raw) ?? parseColor(raw.startsWith('#') ? raw : `#${raw}`);
    if (!parsed) {
      this._draft.set(this.against());
      return;
    }
    const next = raw.startsWith('#') || /^[a-z]+$/i.test(raw) ? raw : `#${raw}`;
    this.against.set(next);
    this._draft.set(next);
  }
}
