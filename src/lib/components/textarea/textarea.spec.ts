import { render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import type { FieldLike } from '../../forms/tanstack-form';
import { Textarea } from './textarea';

function createFieldStub(): FieldLike<string> {
  const field: FieldLike<string> = {
    name: 'test-textarea',
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

describe('Textarea', () => {
  async function renderTextarea(inputs: Partial<Textarea> = {}) {
    return render(Textarea, {
      inputs: {
        field: createFieldStub(),
        ...inputs,
      },
    });
  }

  it('should render the label', async () => {
    await renderTextarea({ label: 'Description' });

    expect(screen.getByText('Description')).toBeTruthy();
  });

  it('should show required asterisk when isRequired is true', async () => {
    const { container } = await renderTextarea({ isRequired: true, label: 'Bio' });

    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toContain('*');
  });

  it('should set placeholder', async () => {
    await renderTextarea({ placeholder: 'Write something' });

    expect(screen.getByPlaceholderText('Write something')).toBeTruthy();
  });

  it('should set rows', async () => {
    await renderTextarea({ rows: 6 });

    expect(screen.getByRole('textbox').getAttribute('rows')).toBe('6');
  });

  it('should show char count when maxLength is set', async () => {
    const field = createFieldStub();
    field.state.value = 'hello';

    await renderTextarea({ field, maxLength: 500 });

    expect(screen.getByText('5/500')).toBeTruthy();
  });

  it('should show hint text', async () => {
    await renderTextarea({ hint: 'Optional description' });

    expect(screen.getByText('Optional description')).toBeTruthy();
  });

  it('should show validation error when errors exist', async () => {
    const field = createFieldStub();
    field.state.meta.errors = [{ message: 'Too short' }];

    await renderTextarea({ field });

    expect(screen.getByRole('alert').textContent).toContain('Too short');
  });
});
