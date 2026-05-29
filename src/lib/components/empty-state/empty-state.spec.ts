import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('should render the title', async () => {
    await render(EmptyState, { inputs: { title: 'No items' } });

    expect(screen.getByRole('heading', { name: 'No items' })).toBeTruthy();
  });

  it('should render the text', async () => {
    await render(EmptyState, { inputs: { text: 'There are no items to show.' } });

    expect(screen.getByText('There are no items to show.')).toBeTruthy();
  });

  it('should render the icon image', async () => {
    const { container } = await render(EmptyState, { inputs: { icon: 'empty-shopping-cart' } });

    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toContain('data:image/svg+xml');
  });

  it('should have a status role', async () => {
    await render(EmptyState);

    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('should not show icon when not provided', async () => {
    const { container } = await render(EmptyState);

    expect(container.querySelector('img')).toBeNull();
  });

  it('should not show title when not provided', async () => {
    await render(EmptyState);

    expect(screen.queryByRole('heading')).toBeNull();
  });
});
