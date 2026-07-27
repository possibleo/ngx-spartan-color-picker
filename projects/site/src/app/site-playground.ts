import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmColorPicker } from 'ngx-spartan-color-picker';

interface ThemeModel {
  color: string;
}

@Component({
  selector: 'site-playground',
  imports: [FormField, HlmButton, HlmColorPicker, NgIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
  template: `
    <section id="playground" class="site-section bg-muted/30" aria-labelledby="playground-heading">
      <div class="site-container">
        <p class="site-kicker">Quick look</p>
        <h2 id="playground-heading" class="site-heading mt-2">Try it</h2>
        <p class="site-lead text-base">
          Everyday bindings on the home page. Open the playground to toggle alpha,
          confirmation, locks, layouts, formats, and optional tools.
        </p>

        <div class="mt-10 grid gap-6 sm:grid-cols-3">
          <div class="site-card">
            <h3 class="text-sm font-medium">Popover</h3>
            <p class="text-muted-foreground mt-1 text-sm">Click the swatch to open.</p>
            <div class="mt-5 flex min-w-0 items-center gap-3">
              <hlm-color-picker [(value)]="playgroundColor" [alpha]="true" />
              <code class="site-inline-code min-w-0 truncate text-xs">{{ playgroundColor() }}</code>
            </div>
          </div>

          <div class="site-card">
            <h3 class="text-sm font-medium">Signal Forms</h3>
            <p class="text-muted-foreground mt-1 text-sm">
              Bound with <code class="site-inline-code">[formField]</code>.
            </p>
            <form class="mt-5 flex flex-col gap-3" (submit)="$event.preventDefault()">
              <div class="flex min-w-0 items-center gap-3">
                <hlm-color-picker [formField]="themeForm().color" ariaLabel="Theme color" />
                <code class="site-inline-code min-w-0 truncate text-xs">{{ themeModel().color }}</code>
              </div>
              @if (themeForm().color().invalid()) {
                <p class="text-destructive text-xs" role="alert">Enter a valid color.</p>
              }
            </form>
          </div>

          <div class="site-card">
            <h3 class="text-sm font-medium">Disabled</h3>
            <p class="text-muted-foreground mt-1 text-sm">Non-interactive state.</p>
            <div class="mt-5">
              <hlm-color-picker value="#CA8A04" [disabled]="true" />
            </div>
          </div>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <a hlmBtn routerLink="/playground">
            Open playground
            <ng-icon name="lucideBookOpen" data-icon="inline-end" />
          </a>
          <a hlmBtn variant="outline" routerLink="/examples">Browse examples</a>
        </div>
      </div>
    </section>
  `,
})
export class SitePlayground {
  readonly playgroundColor = model.required<string>();
  readonly themeForm = input.required<FieldTree<ThemeModel>>();
  readonly themeModel = input.required<ThemeModel>();
}
