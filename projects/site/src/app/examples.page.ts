import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { NgIcon } from '@ng-icons/core';
import { RouterLink } from '@angular/router';
import {
  HlmColorCopy,
  HlmColorEyedropper,
  HlmColorPicker,
  HlmColorPickerPanel,
  hsvaToCss,
  parseColor,
  rgbaToHsva,
  type ColorFormat,
  type ColorLockValues,
  type ColorPickerLayout,
} from 'ngx-spartan-color-picker';
import { SiteExample } from './site-example';
import { SiteTocNav } from './site-toc-nav';

@Component({
  selector: 'examples-page',
  imports: [
    FormField,
    NgIcon,
    RouterLink,
    HlmColorCopy,
    HlmColorEyedropper,
    HlmColorPicker,
    HlmColorPickerPanel,
    SiteExample,
    SiteTocNav,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="site-container pb-24 pt-10 lg:pt-14">
      <div class="max-w-2xl">
        <p class="site-kicker">
          <a routerLink="/" class="hover:text-foreground transition-colors">Home</a>
          <span class="mx-2 text-border" aria-hidden="true">/</span>
          Examples
        </p>
        <h1 id="examples-heading" class="site-heading mt-2">Examples</h1>
        <p class="site-lead text-base">
          Concrete setups for the settings-oriented API — popover, forms, confirmation,
          locks, layouts, formats, eyedropper, copy, and contrast. Each block includes a
          live demo and a starter snippet.
        </p>
      </div>

      <div class="mt-12 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
        <site-toc-nav basePath="/examples" [items]="nav" ariaLabel="Example sections" />

        <div>
          <site-example
            id="popover"
            title="Popover"
            lead="The default entry point: a swatch trigger that opens a panel in a popover."
            body="Use two-way value binding for uncontrolled settings UIs. Enable alpha when you need translucent brand or overlay colors."
            [snippet]="snippets.popover"
          >
            <div class="flex items-center gap-3">
              <hlm-color-picker [(value)]="popoverColor" [alpha]="true" />
              <code class="site-inline-code text-xs">{{ popoverColor() }}</code>
            </div>
          </site-example>

          <site-example
            id="signal-forms"
            title="Signal Forms"
            lead="Wire the picker into Angular Signal Forms with formField."
            body="The control implements FormValueControl, so validation and disabled state flow from the form model."
            [snippet]="snippets.signalForms"
          >
            <form class="flex flex-col gap-3" (submit)="$event.preventDefault()">
              <div class="flex items-center gap-3">
                <hlm-color-picker [formField]="themeForm.color" ariaLabel="Theme color" />
                <code class="site-inline-code text-xs">{{ themeModel().color }}</code>
              </div>
              @if (themeForm.color().invalid()) {
                <p class="text-destructive text-xs" role="alert">Enter a valid color.</p>
              }
            </form>
          </site-example>

          <site-example
            id="inline-panel"
            title="Inline panel"
            lead="Embed hlm-color-picker-panel directly when a popover trigger is not what you want."
            body="Same panel API as the popover — useful for dedicated theme pages or side drawers."
            [snippet]="snippets.inlinePanel"
          >
            <div class="w-fit max-w-full">
              <hlm-color-picker-panel [(value)]="inlineColor" [alpha]="true" />
            </div>
          </site-example>

          <site-example
            id="confirmation"
            title="Confirmation"
            lead="Draft while editing; commit only when the user applies."
            body="Value stays unchanged until Apply. Closing outside or Discard reverts the draft. Listen to draftChange for live previews that should not persist yet."
            [snippet]="snippets.confirmation"
          >
            <div class="flex flex-wrap items-start gap-4">
              <hlm-color-picker
                [(value)]="confirmColor"
                [confirmation]="true"
                [alpha]="true"
                (draftChange)="confirmDraft.set($event)"
                (userChange)="confirmLastUser.set($event)"
              />
              <div class="min-w-0 space-y-1 text-xs">
                <p>
                  Committed
                  <code class="site-inline-code">{{ confirmColor() }}</code>
                </p>
                <p class="text-muted-foreground">
                  Draft
                  <code class="site-inline-code">{{ confirmDraft() }}</code>
                </p>
                <p class="text-muted-foreground">
                  Last user change
                  <code class="site-inline-code">{{ confirmLastUser() }}</code>
                </p>
              </div>
            </div>
          </site-example>

          <site-example
            id="locked"
            title="Locked channels"
            lead="Pin hue, saturation, and/or brightness so users only edit what you allow."
            body="With clamp, the picker forces locked channels on parse and output — ideal for brand color + opacity-only controls. Hide presets when they would fight the lock."
            [snippet]="snippets.locked"
          >
            <div class="flex flex-wrap items-center gap-3">
              <hlm-color-picker
                [(value)]="lockedColor"
                format="rgb"
                [formats]="['rgb']"
                [alpha]="true"
                [copy]="true"
                [lockValues]="opacityLock"
                [presets]="null"
              />
              <code class="site-inline-code text-xs break-all">{{ lockedColor() }}</code>
            </div>
          </site-example>

          <site-example
            id="layouts"
            title="Layouts"
            lead="stack keeps everything in one column; pages splits picker and presets into tabs."
            body="Pages is useful when vertical space is tight or presets are a secondary action."
            [snippet]="snippets.layouts"
          >
            <div
              class="bg-muted/60 flex w-fit gap-0.5 rounded-md p-0.5"
              role="tablist"
              aria-label="Layout demo"
            >
              @for (tab of layoutTabs; track tab.id) {
                <button
                  type="button"
                  role="tab"
                  class="text-muted-foreground hover:text-foreground rounded-sm px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  [class.bg-background]="layoutDemo() === tab.id"
                  [class.text-foreground]="layoutDemo() === tab.id"
                  [class.shadow-xs]="layoutDemo() === tab.id"
                  [attr.aria-selected]="layoutDemo() === tab.id"
                  (click)="layoutDemo.set(tab.id)"
                >
                  {{ tab.label }}
                </button>
              }
            </div>
            <div class="mt-5 w-fit max-w-full">
              <hlm-color-picker-panel
                [(value)]="layoutColor"
                [layout]="layoutDemo()"
                [alpha]="true"
              />
            </div>
          </site-example>

          <site-example
            id="formats"
            title="Formats"
            lead="Control output format and which format tabs appear in the inputs."
            body="hex, rgb, and hsl ship by default. Add oklch via formats when you want modern CSS color output. Changing format rewrites the bound value in that syntax."
            [snippet]="snippets.formats"
          >
            <div
              class="bg-muted/60 flex w-fit flex-wrap gap-0.5 rounded-md p-0.5"
              role="tablist"
              aria-label="Format demo"
            >
              @for (fmt of formatTabs; track fmt) {
                <button
                  type="button"
                  role="tab"
                  class="text-muted-foreground hover:text-foreground rounded-sm px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  [class.bg-background]="formatDemo() === fmt"
                  [class.text-foreground]="formatDemo() === fmt"
                  [class.shadow-xs]="formatDemo() === fmt"
                  [attr.aria-selected]="formatDemo() === fmt"
                  (click)="setFormat(fmt)"
                >
                  {{ fmt }}
                </button>
              }
            </div>
            <div class="mt-5 flex flex-wrap items-start gap-4">
              <hlm-color-picker-panel
                [(value)]="formatColor"
                [(format)]="formatDemo"
                [formats]="formatTabs"
                [alpha]="true"
              />
              <code class="site-inline-code text-xs break-all">{{ formatColor() }}</code>
            </div>
          </site-example>

          <site-example
            id="eyedropper"
            title="Eyedropper"
            lead="Opt-in screen color sampling via the EyeDropper API when the browser supports it."
            body="Default label is text (“Eyedropper”). Project ng-template hlmColorEyedropper for an icon — the library never assumes a specific icon set."
            [snippet]="snippets.eyedropper"
          >
            <div class="w-fit max-w-full">
              <hlm-color-picker-panel [(value)]="eyedropperColor" [eyedropper]="true" [alpha]="true">
                <ng-template hlmColorEyedropper>
                  <ng-icon name="lucidePipette" size="16" />
                </ng-template>
              </hlm-color-picker-panel>
            </div>
          </site-example>

          <site-example
            id="copy"
            title="Copy"
            lead="Opt-in clipboard button for the current formatted value."
            body="Emits (copied) with the string that was written — toast from the host if you want feedback. Project hlmColorCopy for an icon, or keep the text default."
            [snippet]="snippets.copy"
          >
            <div class="flex flex-wrap items-center gap-3">
              <hlm-color-picker
                [(value)]="copyColor"
                [copy]="true"
                [alpha]="true"
                (copied)="lastCopied.set($event)"
              >
                <ng-template hlmColorCopy>
                  <ng-icon name="lucideCopy" size="14" />
                </ng-template>
              </hlm-color-picker>
              <div class="min-w-0 space-y-1 text-xs">
                <p>
                  Value
                  <code class="site-inline-code">{{ copyColor() }}</code>
                </p>
                @if (lastCopied()) {
                  <p class="text-muted-foreground">
                    Last copied
                    <code class="site-inline-code">{{ lastCopied() }}</code>
                  </p>
                }
              </div>
            </div>
          </site-example>

          <site-example
            id="contrast"
            title="Contrast"
            lead="Editable contrast-against color with WCAG AA / AAA checks."
            body="Bind contrastAgainst (two-way). The panel shows pass/fail against the current value — useful for text and UI chrome in settings."
            [snippet]="snippets.contrast"
          >
            <div class="w-fit max-w-full">
              <hlm-color-picker-panel
                [(value)]="contrastColor"
                [(contrastAgainst)]="contrastAgainst"
                [alpha]="true"
              />
            </div>
          </site-example>

          <site-example
            id="disabled"
            title="Disabled"
            lead="Non-interactive chrome for read-only previews."
            [snippet]="snippets.disabled"
          >
            <hlm-color-picker value="#CA8A04" [disabled]="true" />
          </site-example>
        </div>
      </div>
    </div>
  `,
})
export class ExamplesPage {
  readonly nav = [
    { id: 'popover', label: 'Popover' },
    { id: 'signal-forms', label: 'Signal Forms' },
    { id: 'inline-panel', label: 'Inline panel' },
    { id: 'confirmation', label: 'Confirmation' },
    { id: 'locked', label: 'Locked channels' },
    { id: 'layouts', label: 'Layouts' },
    { id: 'formats', label: 'Formats' },
    { id: 'eyedropper', label: 'Eyedropper' },
    { id: 'copy', label: 'Copy' },
    { id: 'contrast', label: 'Contrast' },
    { id: 'disabled', label: 'Disabled' },
  ] as const;

  readonly popoverColor = signal('#E11D48');

  readonly themeModel = signal({ color: '#16A34A' });
  readonly themeForm = form(this.themeModel, (schemaPath) => {
    required(schemaPath.color, { message: 'Color is required' });
  });

  readonly inlineColor = signal('#2563EB');

  readonly confirmColor = signal('#F59E0B');
  readonly confirmDraft = signal('#F59E0B');
  readonly confirmLastUser = signal('#F59E0B');

  readonly lockedColor = signal('rgba(37, 99, 235, 0.9)');
  readonly opacityLock: ColorLockValues = {
    hue: 217,
    saturation: 0.91,
    brightness: 0.92,
    clamp: true,
  };

  readonly layoutDemo = signal<ColorPickerLayout>('pages');
  readonly layoutColor = signal('#7C3AED');
  readonly layoutTabs = [
    { id: 'stack' as const, label: 'Stack' },
    { id: 'pages' as const, label: 'Pages' },
  ];

  readonly formatTabs: ColorFormat[] = ['hex', 'rgb', 'hsl', 'oklch'];
  readonly formatDemo = signal<ColorFormat>('hex');
  readonly formatColor = signal('#2563EB');

  readonly eyedropperColor = signal('#0EA5E9');
  readonly copyColor = signal('#14B8A6');
  readonly lastCopied = signal<string | null>(null);
  readonly contrastColor = signal('#0F172A');
  readonly contrastAgainst = signal('#ffffff');

  setFormat(format: ColorFormat): void {
    this.formatDemo.set(format);
    const parsed = parseColor(this.formatColor());
    if (!parsed) {
      return;
    }
    this.formatColor.set(hsvaToCss(rgbaToHsva(parsed), format, true));
  }

  readonly snippets = {
    popover: `<hlm-color-picker [(value)]="color" [alpha]="true" />`,
    signalForms: `<hlm-color-picker [formField]="themeForm.color" ariaLabel="Theme color" />`,
    inlinePanel: `<hlm-color-picker-panel [(value)]="color" [alpha]="true" />`,
    confirmation: `<hlm-color-picker
  [(value)]="color"
  [confirmation]="true"
  (draftChange)="draft.set($event)"
/>`,
    locked: `<hlm-color-picker
  [(value)]="color"
  format="rgb"
  [formats]="['rgb']"
  [alpha]="true"
  [lockValues]="{ hue: 217, saturation: 0.91, brightness: 0.92, clamp: true }"
  [presets]="null"
/>`,
    layouts: `<hlm-color-picker-panel
  [(value)]="color"
  layout="pages"
  [alpha]="true"
/>`,
    formats: `<hlm-color-picker-panel
  [(value)]="color"
  [(format)]="format"
  [formats]="['hex', 'rgb', 'hsl', 'oklch']"
/>`,
    eyedropper: `<hlm-color-picker-panel [(value)]="color" [eyedropper]="true">
  <ng-template hlmColorEyedropper>…</ng-template>
</hlm-color-picker-panel>`,
    copy: `<hlm-color-picker [(value)]="color" [copy]="true" (copied)="onCopied($event)">
  <ng-template hlmColorCopy>…</ng-template>
</hlm-color-picker>`,
    contrast: `<hlm-color-picker-panel
  [(value)]="color"
  [(contrastAgainst)]="background"
/>`,
    disabled: `<hlm-color-picker value="#CA8A04" [disabled]="true" />`,
  };
}
