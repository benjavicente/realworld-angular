import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog, ConfirmDialogData, ConfirmDialogResult } from './confirm-dialog';

describe('ConfirmDialog', () => {
  const defaultData: ConfirmDialogData = {
    title: 'Are you sure?',
    message: 'This action cannot be undone.',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
  };

  async function renderDialog(data: ConfirmDialogData = defaultData) {
    const closeFn = vi.fn();
    const view = await render(ConfirmDialog, {
      providers: [
        { provide: DialogRef<ConfirmDialogResult>, useValue: { close: closeFn } },
        { provide: DIALOG_DATA, useValue: data },
      ],
    });
    return { ...view, closeFn };
  }

  it('should render the title from data', async () => {
    await renderDialog();

    expect(screen.getByText('Are you sure?')).toBeTruthy();
  });

  it('should render the message from data', async () => {
    await renderDialog();

    expect(screen.getByText('This action cannot be undone.')).toBeTruthy();
  });

  it('should render cancel and confirm buttons', async () => {
    await renderDialog();

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeTruthy();
  });

  it('should close with dismissed when cancel is clicked', async () => {
    const user = userEvent.setup();
    const { closeFn } = await renderDialog();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(closeFn).toHaveBeenCalledWith('dismissed');
  });

  it('should close with confirmed when confirm is clicked', async () => {
    const user = userEvent.setup();
    const { closeFn } = await renderDialog();

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(closeFn).toHaveBeenCalledWith('confirmed');
  });

  it('should not show message when not provided', async () => {
    await renderDialog({ title: 'Test' });

    expect(screen.queryByText('This action cannot be undone.')).toBeNull();
  });
});
