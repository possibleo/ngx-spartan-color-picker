import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Marks an `ng-template` as custom eyedropper button content.
 *
 * @example
 * ```html
 * <hlm-color-picker-panel [eyedropper]="true">
 *   <ng-template hlmColorEyedropper>
 *     <ng-icon name="lucidePipette" />
 *   </ng-template>
 * </hlm-color-picker-panel>
 * ```
 */
@Directive({
  selector: 'ng-template[hlmColorEyedropper]',
})
export class HlmColorEyedropper {
  readonly template = inject(TemplateRef<unknown>);
}
