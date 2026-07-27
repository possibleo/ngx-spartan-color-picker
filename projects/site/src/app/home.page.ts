import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { DEFAULT_PRESETS } from 'ngx-spartan-color-picker';
import { SiteHero } from './site-hero';
import { SiteInstall } from './site-install';
import { SitePlayground } from './site-playground';
import { SiteUsage } from './site-usage';

/** Opaque brand colors only — skip near-black / near-white for hero glow. */
const HERO_PRESETS = DEFAULT_PRESETS.filter(
  (color) => color !== '#0A0A0A' && color !== '#FAFAFA',
);

function pickHeroPreset(): string {
  const index = Math.floor(Math.random() * HERO_PRESETS.length);
  return HERO_PRESETS[index] ?? '#2563EB';
}

@Component({
  selector: 'home-page',
  imports: [SiteHero, SiteInstall, SitePlayground, SiteUsage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
  template: `
    <div class="relative">
      <div
        class="hero-glow pointer-events-none absolute inset-x-0 top-0 h-[32rem] opacity-40"
        [style.background]="heroGlow()"
        aria-hidden="true"
      ></div>

      <site-hero
        [(heroColor)]="heroColor"
        [copied]="copied()"
        (copyInstall)="copyInstall()"
      />

      <site-install />

      <site-usage />

      <site-playground
        [(playgroundColor)]="playgroundColor"
        [themeForm]="themeForm"
        [themeModel]="themeModel()"
      />
    </div>
  `,
})
export class HomePage {
  readonly heroColor = signal(pickHeroPreset());
  readonly playgroundColor = signal('#E11D48');
  readonly themeModel = signal({ color: '#16A34A' });
  readonly themeForm = form(this.themeModel, (schemaPath) => {
    required(schemaPath.color, { message: 'Color is required' });
  });

  readonly copied = signal(false);

  readonly heroGlow = computed(() => {
    const color = this.heroColor();
    return `radial-gradient(ellipse 70% 50% at 50% -10%, color-mix(in oklab, ${color} 35%, transparent), transparent)`;
  });

  async copyInstall(): Promise<void> {
    const command = 'npm i ngx-spartan-color-picker';
    try {
      await navigator.clipboard.writeText(command);
      this.copied.set(true);
      window.setTimeout(() => this.copied.set(false), 1600);
    } catch {
      this.copied.set(false);
    }
  }
}
