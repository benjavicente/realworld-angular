import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
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
  let fixture: ComponentFixture<Textarea>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(Textarea, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    });
    fixture = TestBed.createComponent(Textarea);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('field', createFieldStub());
    await fixture.whenStable();
  });

  it('should render the label', async () => {
    fixture.componentRef.setInput('label', 'Description');
    await fixture.whenStable();
    expect(el.textContent).toContain('Description');
  });

  it('should show required asterisk when isRequired is true', async () => {
    fixture.componentRef.setInput('isRequired', true);
    fixture.componentRef.setInput('label', 'Bio');
    await fixture.whenStable();
    expect(el.querySelector('[aria-hidden="true"]')?.textContent).toContain('*');
  });

  it('should set placeholder', async () => {
    fixture.componentRef.setInput('placeholder', 'Write something');
    await fixture.whenStable();
    const textarea = el.querySelector('textarea');
    expect(textarea?.getAttribute('placeholder')).toBe('Write something');
  });

  it('should set rows', async () => {
    fixture.componentRef.setInput('rows', 6);
    await fixture.whenStable();
    const textarea = el.querySelector('textarea');
    expect(textarea?.getAttribute('rows')).toBe('6');
  });

  it('should show char count when maxLength is set', async () => {
    const field = createFieldStub();
    field.state.value = 'hello';
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('maxLength', 500);
    await fixture.whenStable();
    expect(el.textContent).toContain('5/500');
  });

  it('should show hint text', async () => {
    fixture.componentRef.setInput('hint', 'Optional description');
    await fixture.whenStable();
    expect(el.textContent).toContain('Optional description');
  });

  it('should show validation error when errors exist', async () => {
    const field = createFieldStub();
    field.state.meta.errors = [{ message: 'Too short' }];
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
    expect(el.textContent).toContain('Too short');
  });
});
