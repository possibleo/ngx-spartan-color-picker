import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmColorEyedropper, HlmColorPickerPanel } from 'ngx-spartan-color-picker';

@Component({
  selector: 'site-hero',
  imports: [HlmButton, HlmColorEyedropper, HlmColorPickerPanel, NgIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
  template: `
    <section class="site-container relative z-10 pb-16 pt-10 sm:pb-24 sm:pt-12 lg:pt-20" aria-labelledby="hero-heading">
      <div class="grid min-w-0 items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div class="min-w-0 max-w-lg">
          <p class="site-kicker animate-fade-up">For Spartan NG</p>
          <h1 id="hero-heading" class="site-heading animate-fade-up animate-delay-1 mt-3 text-balance">
            A color picker that fits your
            <span class="hero-accent" [style.color]="heroColor()">Spartan</span>
            stack
          </h1>
          <p class="site-lead animate-fade-up animate-delay-2 text-pretty text-base sm:text-lg">
            Accessible, theme-aware, and built on
            <code class="site-inline-code">@spartan-ng/brain</code>. Drop it into popovers,
            forms, and settings panels without fighting Material styles.
          </p>
          <p class="text-muted-foreground animate-fade-up animate-delay-2 mt-3 text-pretty text-sm">
            Requires Angular <span class="text-foreground font-medium">19+</span>
            (Signal Forms <span class="text-foreground font-medium">21+</span>), Spartan Brain
            <span class="text-foreground font-medium">1.x</span>, and Tailwind
            <span class="text-foreground font-medium">v4</span>.
          </p>

          <div class="animate-fade-up animate-delay-3 mt-8 flex flex-wrap items-center gap-3">
            <button hlmBtn type="button" (click)="copyInstall.emit()">
              <ng-icon
                [name]="copied() ? 'lucideCheck' : 'lucideCopy'"
                data-icon="inline-start"
              />
              {{ copied() ? 'Copied' : 'Copy install command' }}
            </button>
            <a hlmBtn variant="outline" routerLink="/playground">
              <ng-icon name="lucideBookOpen" data-icon="inline-start" />
              Playground
            </a>
          </div>

          <p class="text-muted-foreground animate-fade-up animate-delay-3 mt-4 text-sm">
            <code class="site-inline-code">npm i ngx-spartan-color-picker</code>
          </p>
        </div>

        <div class="animate-fade-up animate-delay-2 min-w-0 lg:justify-self-end lg:pt-2">
          <div class="site-card w-full max-w-sm sm:w-fit">
            <div class="mb-4 flex min-w-0 items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium">Try it</p>
                <p class="text-muted-foreground mt-0.5 text-pretty text-sm">
                  Live with the page glow — refresh for another preset.
                </p>
              </div>
              <span
                class="size-8 shrink-0 rounded-md ring-1 ring-border"
                [style.background]="heroColor()"
                aria-hidden="true"
              ></span>
            </div>
            <hlm-color-picker-panel [(value)]="heroColor" [alpha]="true" [eyedropper]="true">
              <ng-template hlmColorEyedropper>
                <ng-icon name="lucidePipette" size="16" />
              </ng-template>
            </hlm-color-picker-panel>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class SiteHero {
  readonly heroColor = model.required<string>();
  readonly copied = input.required<boolean>();

  readonly copyInstall = output<void>();
}
