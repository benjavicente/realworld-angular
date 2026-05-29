import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { Button } from './button';

@Component({
  imports: [Button],
  template: `
    <button
      rw-button
      [variant]="variant()"
      [palette]="palette()"
      [size]="size()"
      [type]="buttonType()"
      [isDisabled]="isDisabled()"
      [isLoading]="isLoading()"
    >
      Click me
    </button>
  `,
})
class ButtonHostComponent {
  protected readonly variant = signal<'plain' | 'outlined' | 'ghost'>('plain');
  protected readonly palette = signal<'primary' | 'secondary' | 'danger'>('primary');
  protected readonly size = signal<'sm' | 'md'>('md');
  protected readonly buttonType = signal<'button' | 'submit' | 'reset'>('button');
  protected readonly isDisabled = signal(false);
  protected readonly isLoading = signal(false);
}

describe('Button', () => {
  let fixture: ComponentFixture<ButtonHostComponent>;
  let host: ButtonHostComponent;
  let buttonEl: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
    buttonEl = fixture.nativeElement.querySelector('button[rw-button]')!;
  });

  it('should style the host button element', () => {
    expect(buttonEl).not.toBeNull();
    expect(buttonEl.className).toContain('inline-flex');
  });

  it('should apply variant and palette classes', async () => {
    host.variant.set('outlined');
    host.palette.set('danger');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(buttonEl.className).toContain('border-error');
    expect(buttonEl.className).toContain('text-error');
  });

  it('should apply size class', async () => {
    host.size.set('sm');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(buttonEl.className).toContain('px-3');
    expect(buttonEl.className).toContain('text-sm');
  });

  it('should set type attribute', async () => {
    host.buttonType.set('submit');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(buttonEl.type).toBe('submit');
  });

  it('should be disabled when isDisabled is true', async () => {
    host.isDisabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(buttonEl.disabled).toBe(true);
  });

  it('should show loading spinner when isLoading is true', async () => {
    host.isLoading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(buttonEl.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(buttonEl.getAttribute('aria-busy')).toBe('true');
  });

  it('should be disabled when isLoading is true', async () => {
    host.isLoading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(buttonEl.disabled).toBe(true);
  });

  it('should project content', () => {
    expect(buttonEl.textContent).toContain('Click me');
  });
});
