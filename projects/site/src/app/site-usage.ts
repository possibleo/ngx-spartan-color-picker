import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'site-usage',
  imports: [HlmButton, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="usage" class="site-section" aria-labelledby="usage-heading">
      <div class="site-container">
        <p class="site-kicker">Docs</p>
        <h2 id="usage-heading" class="site-heading mt-2">Usage</h2>
        <p class="site-lead text-base">
          Prefer Signal Forms with <code class="site-inline-code">[formField]</code>. The picker
          also implements <code class="site-inline-code">ControlValueAccessor</code> for reactive
          forms. Full option tables live on the API page; toggle features in the playground.
        </p>

        <pre class="site-code-block" tabindex="0"><code>{{ basicSnippet }}</code></pre>

        <div class="mt-8 flex flex-wrap gap-3">
          <a hlmBtn routerLink="/api">API reference</a>
          <a hlmBtn variant="outline" routerLink="/playground">Interactive playground</a>
          <a hlmBtn variant="ghost" routerLink="/examples">Examples</a>
        </div>
      </div>
    </section>
  `,
})
export class SiteUsage {
  readonly basicSnippet = `import { signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { HlmColorPickerImports } from 'ngx-spartan-color-picker';

@Component({
  imports: [FormField, HlmColorPickerImports],
  template: \`
    <hlm-color-picker [formField]="themeForm.color" />
  \`,
})
export class ThemeSettings {
  themeModel = signal({ color: '#16A34A' });
  themeForm = form(this.themeModel);
}`;
}
