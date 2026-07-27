import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'site-install',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
  template: `
    <section id="install" class="site-section bg-muted/30" aria-labelledby="install-heading">
      <div class="site-container">
        <p class="site-kicker">Setup</p>
        <h2 id="install-heading" class="site-heading mt-2">Install</h2>
        <p class="site-lead text-base">
          Community package for apps that already run Spartan. It peers on Brain and follows
          <em>your</em> theme tokens — no style id to configure.
        </p>

        <ul class="mt-8 m-0 flex list-none flex-col gap-3 p-0" role="list">
          @for (row of requirements; track row.name) {
            <li class="rounded-[var(--radius)] border border-border bg-card/40 px-4 py-3">
              <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p class="min-w-0 text-sm font-medium">{{ row.name }}</p>
                <code class="text-muted-foreground font-mono text-xs">{{ row.version }}</code>
              </div>
              <p class="text-muted-foreground mt-1 text-sm leading-relaxed">{{ row.notes }}</p>
            </li>
          }
        </ul>

        <p class="text-muted-foreground mt-6 text-sm">
          New to Spartan? Start at
          <a
            class="text-foreground underline underline-offset-4"
            href="https://spartan.ng/documentation/installation"
            target="_blank"
            rel="noreferrer"
            >spartan.ng/installation</a
          >, then:
        </p>
        <pre class="site-code-block" tabindex="0"><code>npm i ngx-spartan-color-picker</code></pre>

        <p class="text-muted-foreground mt-6 text-sm">
          Full API tables:
          <a routerLink="/api" class="text-foreground underline underline-offset-4">API reference</a>
          · try options in the
          <a routerLink="/playground" class="text-foreground underline underline-offset-4"
            >playground</a
          >.
        </p>
      </div>
    </section>
  `,
})
export class SiteInstall {
  readonly requirements = [
    {
      name: 'Angular',
      version: '≥ 19',
      notes: 'Signal Forms ([formField]) need Angular 21+. Tested on 22.',
    },
    {
      name: '@spartan-ng/brain',
      version: '≥ 1.0',
      notes: 'Popover and slider primitives.',
    },
    {
      name: 'Tailwind CSS',
      version: 'v4',
      notes: 'With Spartan theme CSS variables and --radius.',
    },
    {
      name: 'Spartan theme',
      version: 'host app',
      notes: 'Picker matches your baked style via tokens — demo style switcher is site-only.',
    },
  ] as const;
}
