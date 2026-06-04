import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { HeroBanner } from './hero-banner';

describe('HeroBanner', () => {
  it('should render the edition variant', async () => {
    await render(HeroBanner);

    expect(screen.getByText('Unreal')).toBeTruthy();
  });

  it('should render the banner image', async () => {
    const { container } = await render(HeroBanner);

    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toContain('unrealworld-angular-banner.png');
  });

  it('should have a heading in the sr-only section', async () => {
    await render(HeroBanner);

    expect(screen.getByRole('heading', { name: 'RealWorld Angular' })).toBeTruthy();
  });
});
