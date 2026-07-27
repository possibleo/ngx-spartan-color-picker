import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteTocNav } from './site-toc-nav';

@Component({
  selector: 'api-page',
  imports: [RouterLink, SiteTocNav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
  template: `
    <div class="site-container pb-24 pt-10 lg:pt-14">
      <div class="min-w-0 max-w-2xl">
        <p class="site-kicker">
          <a routerLink="/" class="hover:text-foreground transition-colors">Home</a>
          <span class="mx-2 text-border" aria-hidden="true">/</span>
          API
        </p>
        <h1 id="api-heading" class="site-heading mt-2">API</h1>
        <p class="site-lead text-base">
          Reference for
          <code class="site-inline-code">hlm-color-picker</code>,
          <code class="site-inline-code">hlm-color-picker-panel</code>, content projection,
          events, and helpers. Prefer Signal Forms with
          <code class="site-inline-code">[formField]</code>; CVA is also supported.
        </p>
        <p class="mt-4">
          <a
            routerLink="/playground"
            class="text-foreground text-sm font-medium underline-offset-4 hover:underline"
          >
            Open the interactive playground →
          </a>
        </p>
      </div>

      <div class="site-page-grid">
        <site-toc-nav basePath="/api" [items]="nav" ariaLabel="API sections" />

        <div class="min-w-0">
          <section id="components" class="scroll-mt-28 border-t border-border py-14 first:border-t-0 first:pt-0">
            <h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Components</h2>
            <dl class="mt-6 space-y-4 text-sm">
              @for (row of components; track row.name) {
                <div>
                  <dt class="font-medium">
                    <code class="site-inline-code">{{ row.name }}</code>
                  </dt>
                  <dd class="text-muted-foreground mt-1">{{ row.description }}</dd>
                </div>
              }
            </dl>
            <pre class="site-code-block mt-8 overflow-x-auto text-xs" tabindex="0"><code>{{ importSnippet }}</code></pre>
          </section>

          <section id="inputs" class="scroll-mt-28 border-t border-border py-14">
            <h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Inputs</h2>
            <p class="text-muted-foreground mt-2 max-w-2xl text-sm">
              Shared by the popover picker and inline panel unless noted. Models support
              two-way binding with <code class="site-inline-code">[()]</code>.
            </p>
            <div class="mt-6 min-w-0 overflow-x-auto">
              <table class="w-full min-w-[40rem] border-collapse text-left text-sm">
                <thead>
                  <tr class="border-b border-border text-muted-foreground">
                    <th class="py-2 pr-4 font-medium">Input</th>
                    <th class="py-2 pr-4 font-medium">Type</th>
                    <th class="py-2 pr-4 font-medium">Default</th>
                    <th class="py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody class="align-top">
                  @for (row of inputs; track row.name) {
                    <tr class="border-b border-border/70">
                      <td class="py-3 pr-4 whitespace-nowrap">
                        <code class="site-inline-code text-xs">{{ row.name }}</code>
                      </td>
                      <td class="text-muted-foreground py-3 pr-4 font-mono text-xs whitespace-nowrap">
                        {{ row.type }}
                      </td>
                      <td class="text-muted-foreground py-3 pr-4 font-mono text-xs whitespace-nowrap">
                        {{ row.default }}
                      </td>
                      <td class="text-muted-foreground py-3">{{ row.description }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <section id="outputs" class="scroll-mt-28 border-t border-border py-14">
            <h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Outputs</h2>
            <div class="mt-6 min-w-0 overflow-x-auto">
              <table class="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead>
                  <tr class="border-b border-border text-muted-foreground">
                    <th class="py-2 pr-4 font-medium">Output</th>
                    <th class="py-2 pr-4 font-medium">Payload</th>
                    <th class="py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody class="align-top">
                  @for (row of outputs; track row.name) {
                    <tr class="border-b border-border/70">
                      <td class="py-3 pr-4 whitespace-nowrap">
                        <code class="site-inline-code text-xs">{{ row.name }}</code>
                      </td>
                      <td class="text-muted-foreground py-3 pr-4 font-mono text-xs whitespace-nowrap">
                        {{ row.payload }}
                      </td>
                      <td class="text-muted-foreground py-3">{{ row.description }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <section id="content" class="scroll-mt-28 border-t border-border py-14">
            <h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Content projection</h2>
            <p class="text-muted-foreground mt-2 max-w-2xl text-sm">
              Icons are never baked in. Text labels are the default; project a template when
              you want Lucide, Material, or anything else.
            </p>
            <div class="mt-6 min-w-0 overflow-x-auto">
              <table class="w-full min-w-[32rem] border-collapse text-left text-sm">
                <thead>
                  <tr class="border-b border-border text-muted-foreground">
                    <th class="py-2 pr-4 font-medium">Directive</th>
                    <th class="py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody class="align-top">
                  @for (row of contentSlots; track row.name) {
                    <tr class="border-b border-border/70">
                      <td class="py-3 pr-4 whitespace-nowrap">
                        <code class="site-inline-code text-xs">{{ row.name }}</code>
                      </td>
                      <td class="text-muted-foreground py-3">{{ row.description }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <pre class="site-code-block mt-6 overflow-x-auto text-xs" tabindex="0"><code>{{ projectionSnippet }}</code></pre>
          </section>

          <section id="types" class="scroll-mt-28 border-t border-border py-14">
            <h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Types</h2>
            <div class="mt-6 min-w-0 overflow-x-auto">
              <table class="w-full min-w-[32rem] border-collapse text-left text-sm">
                <thead>
                  <tr class="border-b border-border text-muted-foreground">
                    <th class="py-2 pr-4 font-medium">Type</th>
                    <th class="py-2 font-medium">Shape</th>
                  </tr>
                </thead>
                <tbody class="align-top">
                  @for (row of types; track row.name) {
                    <tr class="border-b border-border/70">
                      <td class="py-3 pr-4 whitespace-nowrap">
                        <code class="site-inline-code text-xs">{{ row.name }}</code>
                      </td>
                      <td class="text-muted-foreground py-3 font-mono text-xs">{{ row.shape }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <section id="theming" class="scroll-mt-28 border-t border-border py-14">
            <h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Theming</h2>
            <p class="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
              No style config required. The picker uses Spartan theme tokens
              (<code class="site-inline-code">bg-popover</code>,
              <code class="site-inline-code">border-border</code>, …) and
              <code class="site-inline-code">--radius</code>. This site’s header style
              switcher is a demo only: it updates helm chrome and
              <code class="site-inline-code">--radius</code> so the picker follows.
            </p>
          </section>
        </div>
      </div>
    </div>
  `,
})
export class ApiPage {
  readonly nav = [
    { id: 'components', label: 'Components' },
    { id: 'inputs', label: 'Inputs' },
    { id: 'outputs', label: 'Outputs' },
    { id: 'content', label: 'Content projection' },
    { id: 'types', label: 'Types' },
    { id: 'theming', label: 'Theming' },
  ] as const;

  readonly components = [
    {
      name: 'hlm-color-picker',
      description: 'Swatch trigger + Brain popover wrapping the panel. Implements FormValueControl and ControlValueAccessor.',
    },
    {
      name: 'hlm-color-picker-panel',
      description: 'Inline panel — SV area, hue/alpha, format inputs, presets, and optional tools. Same option surface as the popover.',
    },
    {
      name: 'HlmColorPickerImports',
      description: 'Barrel array: picker, panel, eyedropper, and copy directives for one import.',
    },
  ] as const;

  readonly importSnippet = `import {
  HlmColorPickerImports,
  type ColorFormat,
} from 'ngx-spartan-color-picker';

@Component({
  imports: [HlmColorPickerImports],
  // …
})`;

  readonly projectionSnippet = `<hlm-color-picker [eyedropper]="true" [copy]="true">
  <ng-template hlmColorEyedropper>
    <ng-icon name="lucidePipette" />
  </ng-template>
  <ng-template hlmColorCopy>
    <ng-icon name="lucideCopy" />
  </ng-template>
</hlm-color-picker>`;

  readonly inputs = [
    {
      name: 'value',
      type: 'model<string>',
      default: "'#2563EB'",
      description: 'CSS color string. Serialized with the active format.',
    },
    {
      name: 'format',
      type: "model<ColorFormat>",
      default: "'hex'",
      description: "Active serializer: 'hex' | 'rgb' | 'hsl' | 'oklch'. Changing it rewrites value.",
    },
    {
      name: 'formats',
      type: 'ColorFormat[]',
      default: "['hex','rgb','hsl']",
      description: 'Formats shown in the panel toggle. Add oklch to opt in.',
    },
    {
      name: 'alpha',
      type: 'boolean',
      default: 'false',
      description: 'Show opacity slider and include alpha in CSS output.',
    },
    {
      name: 'confirmation',
      type: 'boolean',
      default: 'false',
      description:
        'Draft while editing; commit only on Apply. Discard or closing the popover restores the committed value (outside close emits discarded only if the draft changed).',
    },
    {
      name: 'layout',
      type: "ColorPickerLayout",
      default: "'stack'",
      description: "'stack' shows everything; 'pages' tabs between picker and presets.",
    },
    {
      name: 'lockValues',
      type: 'ColorLockValues | null',
      default: 'null',
      description: 'Lock hue / saturation / brightness / alpha. With clamp, picks are forced onto locks.',
    },
    {
      name: 'presets',
      type: 'string[] | null',
      default: 'curated set',
      description: 'Preset swatches. Pass null to hide.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable interaction.',
    },
    {
      name: 'eyedropper',
      type: 'boolean',
      default: 'false',
      description: 'Show the eyedropper control. Works on desktop Chrome/Edge; disabled elsewhere (no EyeDropper API on Android Chrome or Safari).',
    },
    {
      name: 'eyedropperLabel',
      type: 'string',
      default: "'Eyedropper'",
      description: 'Default CTA text when no hlmColorEyedropper template is projected.',
    },
    {
      name: 'eyedropperAriaLabel',
      type: 'string',
      default: "'Pick color from screen'",
      description: 'Accessible name for the eyedropper control.',
    },
    {
      name: 'copy',
      type: 'boolean',
      default: 'false',
      description: 'Show a copy control for the current formatted value.',
    },
    {
      name: 'copyLabel',
      type: 'string',
      default: "'Copy'",
      description: 'Default CTA text when no hlmColorCopy template is projected.',
    },
    {
      name: 'copyAriaLabel',
      type: 'string',
      default: "'Copy color value'",
      description: 'Accessible name for the copy control.',
    },
    {
      name: 'contrastAgainst',
      type: 'model<string | null>',
      default: 'null',
      description: 'When set, shows WCAG contrast UI. Vs color is editable and two-way bindable.',
    },
    {
      name: 'acceptLabel',
      type: 'string',
      default: "'Apply'",
      description: 'Confirmation Apply button label.',
    },
    {
      name: 'cancelLabel',
      type: 'string',
      default: "'Discard'",
      description: 'Confirmation Discard button label.',
    },
    {
      name: 'ariaLabel',
      type: 'string',
      default: "'Choose color'",
      description: 'Accessible name for the trigger / panel group.',
    },
    {
      name: 'page',
      type: "model<ColorPickerPage>",
      default: "'picker'",
      description: "Active page when layout is 'pages' (panel only).",
    },
  ] as const;

  readonly outputs = [
    {
      name: 'userChange',
      payload: 'string',
      description: 'User committed a color (live edit or Apply).',
    },
    {
      name: 'draftChange',
      payload: 'string',
      description: 'Draft updated while editing (especially with confirmation).',
    },
    {
      name: 'copied',
      payload: 'string',
      description: 'Current CSS value was copied. Host can toast — no built-in toast.',
    },
    {
      name: 'applied',
      payload: 'string',
      description: 'Confirmation Apply committed the draft (panel; popover closes).',
    },
    {
      name: 'discarded',
      payload: 'void',
      description:
        'Confirmation Discard pressed, or popover dismissed with an unapplied draft.',
    },
    {
      name: 'open',
      payload: 'void',
      description: 'Popover opened (hlm-color-picker only).',
    },
    {
      name: 'close',
      payload: 'void',
      description: 'Popover closed (hlm-color-picker only).',
    },
    {
      name: 'touch',
      payload: 'void',
      description: 'Popover closed — marks Signal Forms / CVA fields touched.',
    },
  ] as const;

  readonly contentSlots = [
    {
      name: 'hlmColorEyedropper',
      description: 'Projected into the eyedropper button when [eyedropper]="true".',
    },
    {
      name: 'hlmColorCopy',
      description: 'Projected into the copy button when [copy]="true".',
    },
  ] as const;

  readonly types = [
    {
      name: 'ColorFormat',
      shape: "'hex' | 'rgb' | 'hsl' | 'oklch'",
    },
    {
      name: 'ColorPickerLayout',
      shape: "'stack' | 'pages'",
    },
    {
      name: 'ColorPickerPage',
      shape: "'picker' | 'presets'",
    },
    {
      name: 'ColorLockValues',
      shape: '{ hue?, saturation?, brightness?, alpha?, clamp? }',
    },
  ] as const;
}
