import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('should render the animated pizza logo', async () => {
    const { container } = await render(Spinner);

    expect(container.querySelector('rw-pizza-logo')).toBeTruthy();
  });

  it('should have a status role', async () => {
    await render(Spinner);

    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('should have sr-only loading text', async () => {
    await render(Spinner);

    expect(screen.getByText('Loading…')).toBeTruthy();
  });
});
