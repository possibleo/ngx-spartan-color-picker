import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import type { SpartanStyleId } from 'ngx-spartan-color-picker';
import { filter } from 'rxjs';
import { getSpartanStyle } from './spartan-styles';
import type { SpartanStyleOption } from './spartan-styles';

@Component({
  selector: 'site-header',
  imports: [HlmButton, HlmSelectImports, NgIcon, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
  template: `
    <header class="border-border/60 bg-background/80 relative z-20 w-full border-b backdrop-blur-md">
      <div class="site-container flex min-w-0 items-center justify-between gap-2 py-3 sm:gap-3 sm:py-4">
        <a
          routerLink="/"
          class="text-foreground min-w-0 shrink truncate text-sm font-semibold tracking-tight"
          (click)="closeMenu()"
        >
          Spartan Color
        </a>

        <nav aria-label="Primary" class="hidden items-center gap-1 md:flex">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="text-foreground"
              [routerLinkActiveOptions]="item.activeOptions"
              class="text-muted-foreground hover:text-foreground rounded-md px-2.5 py-1.5 text-sm transition-colors"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="flex shrink-0 items-center gap-1 sm:gap-2">
          <hlm-select
            class="hidden w-36 sm:block sm:w-40"
            [value]="style()"
            [itemToString]="styleLabel"
            (valueChange)="onStyleChange($event)"
          >
            <hlm-select-trigger size="sm" class="w-full" buttonId="spartan-style">
              <ng-icon
                name="lucideSwatchBook"
                class="text-muted-foreground size-4 shrink-0"
                aria-hidden="true"
              />
              <hlm-select-value placeholder="Style" />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              <hlm-select-group>
                <hlm-select-label>Spartan style</hlm-select-label>
                @for (option of styles(); track option.id) {
                  <hlm-select-item [value]="option.id">{{ option.label }}</hlm-select-item>
                }
              </hlm-select-group>
            </hlm-select-content>
          </hlm-select>

          <button
            hlmBtn
            variant="ghost"
            size="icon"
            type="button"
            class="shrink-0"
            (click)="themeToggle.emit()"
            [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            @if (isDark()) {
              <ng-icon name="lucideSun" />
            } @else {
              <ng-icon name="lucideMoon" />
            }
          </button>

          <a
            hlmBtn
            variant="outline"
            size="sm"
            class="hidden sm:inline-flex"
            href="https://github.com/possibleo/ngx-spartan-color-picker"
            target="_blank"
            rel="noreferrer"
          >
            <ng-icon name="lucideGithub" data-icon="inline-start" />
            GitHub
          </a>

          <a
            hlmBtn
            variant="outline"
            size="icon"
            class="sm:hidden"
            href="https://github.com/possibleo/ngx-spartan-color-picker"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
          >
            <ng-icon name="lucideGithub" />
          </a>

          <button
            hlmBtn
            variant="ghost"
            size="icon"
            type="button"
            class="md:hidden"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="site-mobile-nav"
            (click)="toggleMenu()"
            [attr.aria-label]="menuOpen() ? 'Close menu' : 'Open menu'"
          >
            @if (menuOpen()) {
              <ng-icon name="lucideX" />
            } @else {
              <ng-icon name="lucideMenu" />
            }
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <div id="site-mobile-nav" class="border-border bg-background border-t md:hidden">
          <nav aria-label="Mobile" class="site-container py-4">
            <ul class="m-0 flex list-none flex-col gap-1 p-0" role="list">
              @for (item of navItems; track item.path) {
                <li>
                  <a
                    [routerLink]="item.path"
                    routerLinkActive="bg-muted text-foreground"
                    [routerLinkActiveOptions]="item.activeOptions"
                    class="text-foreground hover:bg-muted/70 block rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                    (click)="closeMenu()"
                  >
                    {{ item.label }}
                  </a>
                </li>
              }
            </ul>

            <div class="mt-4 space-y-2 border-t border-border pt-4 sm:hidden">
              <p class="text-muted-foreground text-xs font-medium" id="mobile-style-label">
                Spartan style
              </p>
              <hlm-select
                class="w-full"
                [value]="style()"
                [itemToString]="styleLabel"
                (valueChange)="onStyleChange($event)"
              >
                <hlm-select-trigger
                  size="sm"
                  class="w-full"
                  buttonId="spartan-style-mobile"
                  aria-labelledby="mobile-style-label"
                >
                  <ng-icon
                    name="lucideSwatchBook"
                    class="text-muted-foreground size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <hlm-select-value placeholder="Style" />
                </hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal>
                  <hlm-select-group>
                    <hlm-select-label>Spartan style</hlm-select-label>
                    @for (option of styles(); track option.id) {
                      <hlm-select-item [value]="option.id">{{ option.label }}</hlm-select-item>
                    }
                  </hlm-select-group>
                </hlm-select-content>
              </hlm-select>
            </div>
          </nav>
        </div>
      }
    </header>
  `,
})
export class SiteHeader {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly style = input.required<SpartanStyleId>();
  readonly isDark = input.required<boolean>();
  readonly styles = input.required<readonly SpartanStyleOption[]>();

  readonly styleChange = output<SpartanStyleId>();
  readonly themeToggle = output<void>();

  readonly menuOpen = signal(false);

  readonly navItems = [
    { path: '/examples', label: 'Examples', activeOptions: { exact: false } },
    { path: '/playground', label: 'Playground', activeOptions: { exact: false } },
    { path: '/api', label: 'API', activeOptions: { exact: false } },
  ] as const;

  readonly styleLabel = (id: SpartanStyleId | null | undefined): string =>
    id ? getSpartanStyle(id).label : '';

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeMenu());
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  onStyleChange(value: SpartanStyleId | null | undefined): void {
    if (value) {
      this.styleChange.emit(value);
    }
  }
}
