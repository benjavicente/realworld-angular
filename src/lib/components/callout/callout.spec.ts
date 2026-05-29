import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Callout } from './callout';

describe('Callout', () => {
  it('should render the message text', async () => {
    await render(Callout, { inputs: { message: 'Something went wrong.' } });

    expect(screen.getByText('Something went wrong.')).toBeTruthy();
  });

  it('should render the heading when provided', async () => {
    await render(Callout, { inputs: { heading: 'Error', message: 'Details.' } });

    expect(screen.getByText('Error')).toBeTruthy();
  });

  it('should have error variant styling by default', async () => {
    const { fixture } = await render(Callout);

    expect(fixture.nativeElement.classList.contains('border-error/35')).toBe(true);
  });

  it('should have role alert for error variant', async () => {
    await render(Callout);

    const alert = screen.getByRole('alert');
    expect(alert.getAttribute('aria-live')).toBe('assertive');
  });

  it('should have role status for success variant', async () => {
    await render(Callout, { inputs: { variant: 'success' } });

    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
  });

  it('should have no role for neutral variant', async () => {
    const { fixture } = await render(Callout, { inputs: { variant: 'neutral' } });

    expect(fixture.nativeElement.getAttribute('role')).toBeNull();
    expect(fixture.nativeElement.getAttribute('aria-live')).toBeNull();
  });

  it('should apply success styling', async () => {
    const { fixture } = await render(Callout, { inputs: { variant: 'success' } });

    expect(fixture.nativeElement.classList.contains('text-success-bright')).toBe(true);
  });

  it('should have has-heading class when heading is set', async () => {
    const { fixture } = await render(Callout, { inputs: { heading: 'Note' } });

    expect(fixture.nativeElement.classList.contains('items-start')).toBe(true);
  });
});
