import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBookOpen,
  lucideCheck,
  lucideCopy,
  lucideGithub,
  lucideMenu,
  lucideMoon,
  lucidePipette,
  lucideSun,
  lucideSwatchBook,
  lucideX,
} from '@ng-icons/lucide';
import { spartanStyle, type SpartanStyleId } from '@spartan-ng/helm/utils';
import { SPARTAN_STYLES, getSpartanStyle } from './spartan-styles';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteFooter, SiteHeader],
  providers: [
    provideIcons({
      lucideSun,
      lucideMoon,
      lucideCopy,
      lucideCheck,
      lucideBookOpen,
      lucideGithub,
      lucidePipette,
      lucideSwatchBook,
      lucideMenu,
      lucideX,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full min-w-0 max-w-full overflow-x-clip',
  },
  template: `
    <a
      href="#content"
      class="visually-hidden bg-primary text-primary-foreground focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      Skip to content
    </a>

    <div class="relative min-h-dvh w-full min-w-0 max-w-full">
      <site-header
        [style]="style()"
        [isDark]="isDark()"
        [styles]="styles"
        (styleChange)="onStyleChange($event)"
        (themeToggle)="toggleTheme()"
      />

      <main id="content" class="w-full min-w-0 max-w-full" tabindex="-1">
        <router-outlet />
      </main>

      <site-footer />
    </div>
  `,
})
export class App {
  private readonly document = inject(DOCUMENT);

  readonly styles = SPARTAN_STYLES;
  readonly style = spartanStyle;
  readonly isDark = signal(true);

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      const dark = this.isDark();
      const selected = getSpartanStyle(this.style());

      root.classList.toggle('dark', dark);
      root.style.colorScheme = dark ? 'dark' : 'light';
      root.dataset['style'] = selected.id;
      root.style.setProperty('--radius', selected.radius);
    });
  }

  toggleTheme(): void {
    this.isDark.update((value) => !value);
  }

  onStyleChange(value: SpartanStyleId): void {
    this.style.set(value);
  }
}
