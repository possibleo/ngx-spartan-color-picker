import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Shared alpha transparency checkerboard overlay. */
@Component({
  selector: 'hlm-color-checkerboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hlm-color-checkerboard pointer-events-none absolute inset-0',
    'aria-hidden': 'true',
  },
  template: '',
  styles: `
    :host {
      opacity: 0.4;
      background-image:
        linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
      background-size: 8px 8px;
      background-position:
        0 0,
        0 4px,
        4px -4px,
        -4px 0;
    }
  `,
})
export class HlmColorCheckerboard {}
