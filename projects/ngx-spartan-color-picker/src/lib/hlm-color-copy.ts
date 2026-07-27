import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Marks an `ng-template` as custom copy-button content.
 *
 * @example
 * ```html
 * <hlm-color-picker-panel [copy]="true">
 *   <ng-template hlmColorCopy>
 *     <ng-icon name="lucideCopy" />
 *   </ng-template>
 * </hlm-color-picker-panel>
 * ```
 */
@Directive({
  selector: 'ng-template[hlmColorCopy]',
})
export class HlmColorCopy {
  readonly template = inject(TemplateRef<unknown>);
}
