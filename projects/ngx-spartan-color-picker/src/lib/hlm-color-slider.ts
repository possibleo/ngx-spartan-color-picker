import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { BrnSliderImports } from '@spartan-ng/brain/slider';
import { HlmColorCheckerboard } from './hlm-color-checkerboard';

export type HlmColorSliderKind = 'hue' | 'alpha' | 'neutral';

/**
 * Color-channel slider built on Spartan Brain's BrnSlider (not a native range input).
 * Track gradients are color-picker specific; thumb positioning comes from Brain.
 */
@Component({
  selector: 'hlm-color-slider',
  imports: [BrnSliderImports, HlmColorCheckerboard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
    '[style.--hlm-slider-thumb]': 'thumbColor()',
    '[style.--hlm-slider-fill]': 'fillColor()',
  },
  template: `
    <div
      brnSlider
      class="group flex w-full touch-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [disabled]="disabled()"
      [value]="brnValue()"
      [aria-label]="label()"
      (valueChange)="onBrnValueChange($event)"
    >
      <div class="relative flex h-5 w-full items-center">
        <div
          brnSliderTrack
          class="relative h-3 grow overflow-hidden rounded-full ring-1 ring-foreground/10"
          [class.hlm-color-track--hue]="kind() === 'hue'"
          [class.hlm-color-track--alpha]="kind() === 'alpha'"
          [class.hlm-color-track--neutral]="kind() === 'neutral'"
        >
          @if (kind() === 'alpha') {
            <hlm-color-checkerboard />
            <div
              class="absolute inset-0 rounded-full"
              aria-hidden="true"
              [style.background]="'linear-gradient(to right, transparent, var(--hlm-slider-fill))'"
            ></div>
          }
          @if (kind() === 'neutral') {
            <div
              class="absolute inset-0 rounded-full"
              aria-hidden="true"
              [style.background]="
                'linear-gradient(to right, #000, var(--hlm-slider-fill, #fff))'
              "
            ></div>
          }

          <!-- Range fill unused for color channels; required by Brain structure. -->
          <div brnSliderRange class="pointer-events-none absolute h-full opacity-0"></div>
        </div>

        <span
          brnSliderThumb
          class="border-background absolute block size-3.5 shrink-0 rounded-full border-2 shadow-sm ring-1 ring-black/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          [style.background]="'var(--hlm-slider-thumb)'"
        ></span>
      </div>
    </div>
  `,
  styles: `
    .hlm-color-track--hue {
      background: linear-gradient(
        to right,
        #f00 0%,
        #ff0 17%,
        #0f0 33%,
        #0ff 50%,
        #00f 67%,
        #f0f 83%,
        #f00 100%
      );
    }

    .hlm-color-track--alpha {
      background: transparent;
    }
  `,
})
export class HlmColorSlider {
  readonly kind = input<HlmColorSliderKind>('hue');
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly disabled = input(false, {
    transform: (value: unknown) => booleanAttribute(value),
  });
  readonly thumbColor = input('#ffffff');
  readonly fillColor = input('#ffffff');

  readonly valueChange = output<number>();

  protected readonly brnValue = computed(() => [this.value()]);

  protected onBrnValueChange(values: number[]): void {
    const next = values[0];
    if (next === undefined || next === this.value()) {
      return;
    }
    this.valueChange.emit(next);
  }
}
