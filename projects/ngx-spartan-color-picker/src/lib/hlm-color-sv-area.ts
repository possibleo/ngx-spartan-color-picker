import { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { Hsva, clamp } from './color-utils';
import { hlmStyle } from './spartan-style';

let nextHintId = 0;

/**
 * 2D saturation/brightness pad.
 * Uses a focusable group (not role="slider") because ARIA sliders are 1D;
 * keyboard help + live region announce both axes.
 */
@Component({
  selector: 'hlm-color-sv-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <div
      #area
      [class]="areaClass()"
      role="group"
      tabindex="0"
      aria-label="Saturation and brightness"
      [attr.aria-describedby]="hintId"
      [attr.aria-disabled]="disabled() ? 'true' : null"
      [style.background]="hueColor()"
      (pointerdown)="onPointerDown($event, area)"
      (keydown)="onKeydown($event)"
    >
      <span [id]="hintId" class="hlm-sr-only">
        Use arrow keys to adjust saturation and brightness. Hold Shift for larger steps. Home and
        End set saturation; Page Up and Page Down set brightness.
      </span>
      <span class="hlm-sr-only" aria-live="polite" aria-atomic="true">{{ liveText() }}</span>

      <div class="pointer-events-none absolute inset-0 bg-linear-to-r from-white to-transparent"></div>
      <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black to-transparent"></div>
      <div
        class="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-1 ring-black/30"
        [style.left.%]="hsva().s * 100"
        [style.top.%]="(1 - hsva().v) * 100"
        [style.background]="thumbColor()"
      ></div>
    </div>
  `,
  styles: `
    .hlm-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `,
})
export class HlmColorSvArea {
  readonly hsva = input.required<Hsva>();
  readonly hueColor = input.required<string>();
  readonly thumbColor = input.required<string>();
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  readonly hsvaChange = output<Pick<Hsva, 's' | 'v'>>();

  protected readonly hintId = `hlm-color-sv-hint-${nextHintId++}`;

  protected readonly areaClass = computed(() =>
    hlmStyle(
      'spartan-color-surface',
      'relative h-40 w-full touch-none overflow-hidden ring-1 ring-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-ring',
    ),
  );

  /** Announced on keyboard changes; empty while idle so pointer drags stay quiet. */
  private readonly _liveText = signal('');
  protected readonly liveText = this._liveText.asReadonly();

  protected onPointerDown(event: PointerEvent, area: HTMLElement): void {
    if (this.disabled() || event.button !== 0) {
      return;
    }
    event.preventDefault();
    area.focus();
    area.setPointerCapture(event.pointerId);
    this.updateFromPointer(event, area, false);

    const onMove = (moveEvent: PointerEvent) => this.updateFromPointer(moveEvent, area, false);
    const onUp = () => {
      area.releasePointerCapture(event.pointerId);
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerup', onUp);
      area.removeEventListener('pointercancel', onUp);
    };

    area.addEventListener('pointermove', onMove);
    area.addEventListener('pointerup', onUp);
    area.addEventListener('pointercancel', onUp);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    const step = event.shiftKey ? 0.1 : 0.01;
    const current = this.hsva();
    let s = current.s;
    let v = current.v;

    switch (event.key) {
      case 'ArrowLeft':
        s -= step;
        break;
      case 'ArrowRight':
        s += step;
        break;
      case 'ArrowUp':
        v += step;
        break;
      case 'ArrowDown':
        v -= step;
        break;
      case 'Home':
        s = 0;
        break;
      case 'End':
        s = 1;
        break;
      case 'PageUp':
        v = 1;
        break;
      case 'PageDown':
        v = 0;
        break;
      default:
        return;
    }

    event.preventDefault();
    const next = { s: clamp(s), v: clamp(v) };
    this.hsvaChange.emit(next);
    this._liveText.set(
      `Saturation ${Math.round(next.s * 100)} percent, brightness ${Math.round(next.v * 100)} percent`,
    );
  }

  private updateFromPointer(event: PointerEvent, area: HTMLElement, announce: boolean): void {
    const rect = area.getBoundingClientRect();
    const s = clamp((event.clientX - rect.left) / rect.width);
    const v = clamp(1 - (event.clientY - rect.top) / rect.height);
    this.hsvaChange.emit({ s, v });
    if (announce) {
      this._liveText.set(
        `Saturation ${Math.round(s * 100)} percent, brightness ${Math.round(v * 100)} percent`,
      );
    }
  }
}
