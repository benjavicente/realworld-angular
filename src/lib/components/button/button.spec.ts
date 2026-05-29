import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
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
  public readonly variant = signal<'plain' | 'outlined' | 'ghost'>('plain');
  public readonly palette = signal<'primary' | 'secondary' | 'danger'>('primary');
  public readonly size = signal<'sm' | 'md'>('md');
  public readonly buttonType = signal<'button' | 'submit' | 'reset'>('button');
  public readonly isDisabled = signal(false);
  public readonly isLoading = signal(false);
}

describe('Button', () => {
  async function renderButton() {
    const view = await render(ButtonHostComponent);
    return {
      ...view,
      host: view.fixture.componentInstance,
      button: screen.getByRole('button', { name: /click me/i }) as HTMLButtonElement,
    };
  }

  it('should style the host button element', async () => {
    const { button } = await renderButton();

    expect(button.className).toContain('inline-flex');
  });

  it('should apply variant and palette classes', async () => {
    const { fixture, host, button } = await renderButton();

    host.variant.set('outlined');
    host.palette.set('danger');
    fixture.detectChanges();

    expect(button.className).toContain('border-error');
    expect(button.className).toContain('text-error');
  });

  it('should apply size class', async () => {
    const { fixture, host, button } = await renderButton();

    host.size.set('sm');
    fixture.detectChanges();

    expect(button.className).toContain('px-3');
    expect(button.className).toContain('text-sm');
  });

  it('should set type attribute', async () => {
    const { fixture, host, button } = await renderButton();

    host.buttonType.set('submit');
    fixture.detectChanges();

    expect(button.type).toBe('submit');
  });

  it('should be disabled when isDisabled is true', async () => {
    const { fixture, host, button } = await renderButton();

    host.isDisabled.set(true);
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
  });

  it('should show loading spinner when isLoading is true', async () => {
    const { fixture, host, button } = await renderButton();

    host.isLoading.set(true);
    fixture.detectChanges();

    expect(button.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('should be disabled when isLoading is true', async () => {
    const { fixture, host, button } = await renderButton();

    host.isLoading.set(true);
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
  });

  it('should project content', async () => {
    await renderButton();

    expect(screen.getByRole('button', { name: /click me/i })).toBeTruthy();
  });
});
