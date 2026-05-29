import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('should show Pending for PENDING status', async () => {
    const { fixture } = await render(StatusBadge, { inputs: { status: 'PENDING' } });

    expect(screen.getByText('Pending')).toBeTruthy();
    expect(fixture.nativeElement.classList.contains('text-warning-text')).toBe(true);
  });

  it('should show Preparing for PREPARING status', async () => {
    const { fixture } = await render(StatusBadge, { inputs: { status: 'PREPARING' } });

    expect(screen.getByText('Preparing')).toBeTruthy();
    expect(fixture.nativeElement.classList.contains('text-info')).toBe(true);
  });

  it('should show Ready for READY status', async () => {
    const { fixture } = await render(StatusBadge, { inputs: { status: 'READY' } });

    expect(screen.getByText('Ready')).toBeTruthy();
    expect(fixture.nativeElement.classList.contains('text-success')).toBe(true);
  });

  it('should show Delivered for DELIVERED status', async () => {
    const { fixture } = await render(StatusBadge, { inputs: { status: 'DELIVERED' } });

    expect(screen.getByText('Delivered')).toBeTruthy();
    expect(fixture.nativeElement.classList.contains('bg-primary')).toBe(true);
  });

  it('should show Cancelled for CANCELLED status', async () => {
    const { fixture } = await render(StatusBadge, { inputs: { status: 'CANCELLED' } });

    expect(screen.getByText('Cancelled')).toBeTruthy();
    expect(fixture.nativeElement.classList.contains('text-text-muted')).toBe(true);
  });
});
