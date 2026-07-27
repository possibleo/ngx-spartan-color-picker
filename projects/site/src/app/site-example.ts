import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

@Component({
  selector: 'site-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article [id]="id()" class="scroll-mt-28 border-t border-border py-14 first:border-t-0 first:pt-0">
      <div class="max-w-2xl">
        <h2 class="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
          {{ title() }}
        </h2>
        <p class="text-muted-foreground mt-2 text-base leading-relaxed">{{ lead() }}</p>
        @if (body()) {
          <p class="text-muted-foreground mt-3 text-sm leading-relaxed">{{ body() }}</p>
        }
      </div>

      <div class="site-card mt-8">
        <ng-content />
      </div>

      @if (snippet()) {
        <pre class="site-code-block mt-4 overflow-x-auto text-xs" tabindex="0"><code>{{ snippet() }}</code></pre>
      }
    </article>
  `,
})
export class SiteExample {
  readonly id = input.required<string>();
  readonly title = input.required<string>();
  readonly lead = input.required<string>();
  readonly body = input<string>();
  readonly snippet = input<string>();
}
