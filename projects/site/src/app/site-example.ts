import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

@Component({
  selector: 'site-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
  template: `
    <article [id]="id()" class="w-full min-w-0 scroll-mt-28 border-t border-border py-14 first:border-t-0 first:pt-0">
      <div class="min-w-0 max-w-2xl">
        <h2 class="text-foreground text-balance text-xl font-semibold tracking-tight sm:text-2xl">
          {{ title() }}
        </h2>
        <p class="text-muted-foreground mt-2 text-pretty text-base leading-relaxed">{{ lead() }}</p>
        @if (body()) {
          <p class="text-muted-foreground mt-3 text-pretty text-sm leading-relaxed">{{ body() }}</p>
        }
      </div>

      <div class="site-card mt-8">
        <ng-content />
      </div>

      @if (snippet()) {
        <pre class="site-code-block mt-4" tabindex="0"><code>{{ snippet() }}</code></pre>
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
