import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'site-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
  template: `
    <footer class="border-t border-border w-full">
      <div
        class="site-container flex flex-col gap-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
      >
        <p>Built for the Spartan NG ecosystem.</p>
        <nav aria-label="Footer">
          <ul class="flex list-none flex-wrap gap-6 p-0">
            <li>
              <a class="hover:text-foreground transition-colors" routerLink="/examples"
                >Examples</a
              >
            </li>
            <li>
              <a class="hover:text-foreground transition-colors" routerLink="/playground"
                >Playground</a
              >
            </li>
            <li>
              <a class="hover:text-foreground transition-colors" routerLink="/api">API</a>
            </li>
            <li>
              <a
                class="hover:text-foreground transition-colors"
                href="https://www.npmjs.com/package/ngx-spartan-color-picker"
                >npm</a
              >
            </li>
            <li>
              <a
                class="hover:text-foreground transition-colors"
                href="https://spartan.ng"
                target="_blank"
                rel="noreferrer"
                >spartan.ng</a
              >
            </li>
            <li>
              <a
                class="hover:text-foreground transition-colors"
                href="https://github.com/possibleo/ngx-spartan-color-picker"
                target="_blank"
                rel="noreferrer"
                >GitHub</a
              >
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  `,
})
export class SiteFooter {}
