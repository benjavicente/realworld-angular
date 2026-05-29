import { DialogRef } from '@angular/cdk/dialog';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './modal';

describe('Modal', () => {
  async function renderModal() {
    const closeFn = vi.fn();
    const view = await render(Modal, {
      providers: [{ provide: DialogRef, useValue: { close: closeFn } }],
    });
    return { ...view, closeFn };
  }

  it('should render the title', async () => {
    await render(Modal, {
      inputs: { title: 'Confirm action' },
      providers: [{ provide: DialogRef, useValue: { close: vi.fn() } }],
    });

    expect(screen.getByText('Confirm action')).toBeTruthy();
  });

  it('should have a close button', async () => {
    await renderModal();

    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeTruthy();
  });

  it('should close dialog when close button is clicked', async () => {
    const user = userEvent.setup();
    const { closeFn } = await renderModal();

    await user.click(screen.getByRole('button', { name: 'Close dialog' }));

    expect(closeFn).toHaveBeenCalled();
  });

  it('should have role document on the panel', async () => {
    await renderModal();

    expect(screen.getByRole('document')).toBeTruthy();
  });
});
