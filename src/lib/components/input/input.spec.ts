import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
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
  let fixture: ComponentFixture<Input>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(Input, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    });
    fixture = TestBed.createComponent(Input);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('field', createFieldStub());
    await fixture.whenStable();
  });

  it('should render the label', async () => {
    fixture.componentRef.setInput('label', 'Email');
    await fixture.whenStable();
    expect(el.textContent).toContain('Email');
  });

  it('should set input type', async () => {
    fixture.componentRef.setInput('type', 'email');
    await fixture.whenStable();
    const input = el.querySelector('input');
    expect(input?.getAttribute('type')).toBe('email');
  });

  it('should set placeholder', async () => {
    fixture.componentRef.setInput('placeholder', 'Enter text');
    await fixture.whenStable();
    const input = el.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Enter text');
  });

  it('should show hint text', async () => {
    fixture.componentRef.setInput('hint', 'Must be at least 8 characters');
    await fixture.whenStable();
    expect(el.textContent).toContain('Must be at least 8 characters');
  });

  it('should show required asterisk when isRequired is true', async () => {
    fixture.componentRef.setInput('isRequired', true);
    fixture.componentRef.setInput('label', 'Name');
    await fixture.whenStable();
    expect(el.querySelector('[aria-hidden="true"]')?.textContent).toContain('*');
  });

  it('should show validation error when errors exist', async () => {
    const field = createFieldStub();
    field.state.meta.errors = [{ message: 'This field is required' }];
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
    expect(el.textContent).toContain('This field is required');
  });

  it('should apply error styling when errors exist', async () => {
    const field = createFieldStub();
    field.state.meta.errors = [{ message: 'Error' }];
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
    expect(el.querySelector('input')?.classList.contains('border-error')).toBe(true);
  });
});
