import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { PizzaLogo } from './pizza-logo';

describe('PizzaLogo', () => {
  it('should render an SVG element', async () => {
    const { container } = await render(PizzaLogo);

    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should set width and height from size input', async () => {
    const { container } = await render(PizzaLogo, { inputs: { size: 48 } });

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('48');
    expect(svg?.getAttribute('height')).toBe('48');
  });

  it('should be aria-hidden when no label', async () => {
    const { container } = await render(PizzaLogo);

    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should have role img and aria-label when label is set', async () => {
    await render(PizzaLogo, { inputs: { label: 'Pizza logo' } });

    const svg = screen.getByRole('img', { name: 'Pizza logo' });
    expect(svg.getAttribute('aria-hidden')).toBeNull();
  });

  it('should apply animated slice class when animated is true', async () => {
    const { container } = await render(PizzaLogo, { inputs: { animated: true } });

    expect(
      container
        .querySelector('svg g')
        ?.classList.contains('animate-[pizza-slice-step_1.2s_steps(6,end)_infinite]'),
    ).toBe(true);
  });

  it('should render 6 slice paths', async () => {
    const { container } = await render(PizzaLogo);

    expect(container.querySelectorAll('path').length).toBe(6);
  });
});
