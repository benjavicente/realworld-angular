import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Avatar } from './avatar';

describe('Avatar', () => {
  it('should render initials for a two-part name', async () => {
    await render(Avatar, { inputs: { name: 'Foo Bar' } });

    expect(screen.getByText('FB')).toBeTruthy();
  });

  it('should render first two chars for a single-part name', async () => {
    await render(Avatar, { inputs: { name: 'gerome' } });

    expect(screen.getByText('GE')).toBeTruthy();
  });

  it('should have aria-label with the name', async () => {
    await render(Avatar, { inputs: { name: 'Jane Doe' } });

    expect(screen.getByRole('img', { name: 'Avatar for Jane Doe' })).toBeTruthy();
  });

  it('should apply size class', async () => {
    await render(Avatar, { inputs: { name: 'Jane Doe', size: 'sm' } });

    expect(
      screen.getByRole('img', { name: 'Avatar for Jane Doe' }).classList.contains('size-8'),
    ).toBe(true);
  });
});
