import { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { hlmStyle } from './spartan-style';

@Component({
  selector: 'hlm-color-presets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <ul class="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Preset colors">
      @for (preset of presets(); track preset) {
        <li>
          <button
            type="button"
            [class]="presetClass()"
            [attr.aria-label]="'Select color ' + preset"
            [attr.aria-pressed]="preset.toLowerCase() === selected()?.toLowerCase()"
            [disabled]="disabled()"
            [style.background]="preset"
            (click)="select.emit(preset)"
          ></button>
        </li>
      }
    </ul>
  `,
})
export class HlmColorPresets {
  readonly presets = input.required<readonly string[]>();
  readonly selected = input<string | null>(null);
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  readonly select = output<string>();

  protected readonly presetClass = computed(() =>
    hlmStyle(
      'spartan-color-surface',
      'size-6 ring-1 ring-foreground/15 outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    ),
  );
}
