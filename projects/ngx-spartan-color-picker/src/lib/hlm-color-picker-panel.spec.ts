import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { HlmColorPickerPanel } from './hlm-color-picker-panel';

describe('HlmColorPickerPanel', () => {
  let fixture: ComponentFixture<HlmColorPickerPanel>;
  let component: HlmColorPickerPanel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(HlmColorPickerPanel);
    component = fixture.componentInstance;
  });

  it('rewrites value when format changes', async () => {
    fixture.componentRef.setInput('alpha', true);
    component.value.set('#2563EB');
    await fixture.whenStable();

    component.format.set('rgb');
    await fixture.whenStable();

    expect(component.value()).toMatch(/^rgba?\(/);
  });

  it('keeps value uncommitted until Apply in confirmation mode', async () => {
    fixture.componentRef.setInput('confirmation', true);
    component.value.set('#111111');
    await fixture.whenStable();

    const drafts: string[] = [];
    const users: string[] = [];
    component.draftChange.subscribe((value) => drafts.push(value));
    component.userChange.subscribe((value) => users.push(value));

    component['patchHsva']({ h: 200, s: 0.8, v: 0.7, a: 1 });
    await fixture.whenStable();

    expect(component.value()).toBe('#111111');
    expect(drafts.length).toBeGreaterThan(0);
    expect(users).toEqual([]);

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const applyBtn = buttons.find((button) => button.textContent?.trim() === 'Apply');
    expect(applyBtn).toBeTruthy();
    applyBtn!.click();
    await fixture.whenStable();

    expect(component.value()).not.toBe('#111111');
    expect(users.length).toBe(1);
  });

  it('restores committed value on Discard', async () => {
    fixture.componentRef.setInput('confirmation', true);
    component.value.set('#ABCDEF');
    await fixture.whenStable();

    component['patchHsva']({ h: 10, s: 1, v: 1, a: 1 });
    await fixture.whenStable();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const discardBtn = buttons.find((button) => button.textContent?.trim() === 'Discard');
    expect(discardBtn).toBeTruthy();

    let discarded = false;
    component.discarded.subscribe(() => {
      discarded = true;
    });

    discardBtn!.click();
    await fixture.whenStable();

    expect(component.value()).toBe('#ABCDEF');
    expect(discarded).toBe(true);
  });

  it('hides SV area when saturation and brightness are locked', async () => {
    fixture.componentRef.setInput('lockValues', {
      hue: 217,
      saturation: 0.9,
      brightness: 0.9,
      clamp: true,
    });
    fixture.componentRef.setInput('alpha', true);
    component.value.set('rgba(37, 99, 235, 0.8)');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('hlm-color-sv-area')).toBeNull();
    expect(
      Array.from(fixture.nativeElement.querySelectorAll('hlm-color-slider')).length,
    ).toBe(1);
  });

  it('exposes tablist ARIA wiring in pages layout', async () => {
    fixture.componentRef.setInput('layout', 'pages');
    component.value.set('#2563EB');
    await fixture.whenStable();

    const tablist = fixture.nativeElement.querySelector('[role="tablist"]');
    expect(tablist).toBeTruthy();

    const tabs = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]'),
    ) as HTMLElement[];
    expect(tabs.length).toBe(2);
    expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
    expect(tabs[0]!.getAttribute('aria-controls')).toBe('hlm-color-picker-panel-picker');
    expect(tabs[1]!.getAttribute('tabindex')).toBe('-1');

    tabs[1]!.click();
    await fixture.whenStable();

    expect(component.page()).toBe('presets');
    expect(tabs[1]!.getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('#hlm-color-picker-panel-presets')).toBeTruthy();
  });

  it('dismissDraft emits discarded only when dirty', async () => {
    fixture.componentRef.setInput('confirmation', true);
    component.value.set('#101010');
    await fixture.whenStable();

    let discardedCount = 0;
    component.discarded.subscribe(() => {
      discardedCount += 1;
    });

    component.dismissDraft();
    expect(discardedCount).toBe(0);

    component['patchHsva']({ h: 40, s: 0.5, v: 0.5, a: 1 });
    component.dismissDraft();
    expect(discardedCount).toBe(1);
    expect(component.value()).toBe('#101010');
  });
});
