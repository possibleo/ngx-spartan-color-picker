import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

export interface SiteTocItem {
  readonly id: string;
  readonly label: string;
}

@Component({
  selector: 'site-toc-nav',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="lg:sticky lg:top-8 lg:self-start" [attr.aria-label]="ariaLabel()">
      <p class="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
        On this page
      </p>
      <ul class="flex list-none flex-row flex-wrap gap-2 p-0 lg:flex-col lg:gap-1" role="list">
        @for (item of items(); track item.id) {
          <li>
            <a
              [routerLink]="basePath()"
              [fragment]="item.id"
              class="hover:text-foreground block rounded-md px-2.5 py-1.5 text-sm transition-colors"
              [class.text-foreground]="activeId() === item.id"
              [class.bg-muted]="activeId() === item.id"
              [class.font-medium]="activeId() === item.id"
              [class.text-muted-foreground]="activeId() !== item.id"
              [attr.aria-current]="activeId() === item.id ? 'location' : null"
              (click)="onNavigate($event, item.id)"
            >
              {{ item.label }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class SiteTocNav {
  private readonly destroyRef = inject(DestroyRef);

  /** Route path without hash, e.g. `/examples`. */
  readonly basePath = input.required<string>();
  readonly items = input.required<readonly SiteTocItem[]>();
  readonly ariaLabel = input('On this page');

  readonly activeId = signal<string | null>(null);

  constructor() {
    afterNextRender(() => {
      const sections = this.items()
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => !!el);

      if (sections.length === 0) {
        return;
      }

      this.activeId.set(sections[0]!.id);

      const visible = new Set<string>();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              visible.add(entry.target.id);
            } else {
              visible.delete(entry.target.id);
            }
          }

          const next =
            this.items().find((item) => visible.has(item.id))?.id ?? this.activeId();
          if (next) {
            this.activeId.set(next);
          }
        },
        {
          // Highlight the section sitting in the upper portion of the viewport.
          rootMargin: '-15% 0px -65% 0px',
          threshold: [0, 0.1, 0.25],
        },
      );

      for (const section of sections) {
        observer.observe(section);
      }

      this.destroyRef.onDestroy(() => observer.disconnect());

      const hash = window.location.hash.replace(/^#/, '');
      if (hash && sections.some((section) => section.id === hash)) {
        this.activeId.set(hash);
      }
    });
  }

  onNavigate(event: Event, id: string): void {
    event.preventDefault();
    this.activeId.set(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const url = `${this.basePath()}#${id}`;
    if (window.location.pathname + window.location.hash !== url) {
      history.pushState(null, '', url);
    }
  }
}
