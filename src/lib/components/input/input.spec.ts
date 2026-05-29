import { render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import type { FieldLike } from '../../forms/tanstack-form';
import { Input } from './input';

function createFieldStub(): FieldLike<string | number | null> {
  const field: FieldLike<string | number | null> = {
    name: 'test-input',
    state: {
      value: '',
      meta: {
        errors: [],
        isTouched: false,
      },
    },
    handleBlur: vi.fn(() => {
      field.state.meta.isTouched = true;
    }),
    handleChange: vi.fn((value) => {
      field.state.value = value;
    }),
  };
  return field;
}

describe('Input', () => {
  async function renderInput(inputs: Partial<Input> = {}) {
    return render(Input, {
      inputs: {
        field: createFieldStub(),
        ...inputs,
      },
    });
  }

  it('should render the label', async () => {
    await renderInput({ label: 'Email' });

    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('should set input type', async () => {
    await renderInput({ type: 'email' });

    expect(screen.getByRole('textbox').getAttribute('type')).toBe('email');
  });

  it('should set placeholder', async () => {
    await renderInput({ placeholder: 'Enter text' });

    expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should show hint text', async () => {
    await renderInput({ hint: 'Must be at least 8 characters' });

    expect(screen.getByText('Must be at least 8 characters')).toBeTruthy();
  });

  it('should show required asterisk when isRequired is true', async () => {
    const { container } = await renderInput({ isRequired: true, label: 'Name' });

    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toContain('*');
  });

  it('should show validation error when errors exist', async () => {
    const field = createFieldStub();
    field.state.meta.errors = [{ message: 'This field is required' }];

    await renderInput({ field });

    expect(screen.getByRole('alert').textContent).toContain('This field is required');
  });

  it('should apply error styling when errors exist', async () => {
    const field = createFieldStub();
    field.state.meta.errors = [{ message: 'Error' }];

    await renderInput({ field });

    expect(screen.getByRole('textbox').classList.contains('border-error')).toBe(true);
  });
});
