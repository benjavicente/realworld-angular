export interface FieldLike<T = unknown> {
  name: string;
  state: {
    value: T;
    meta: {
      errors: unknown[];
      isTouched: boolean;
    };
  };
  handleBlur: () => void;
  handleChange: (value: T) => void;
}

export const fieldErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Invalid value';
};

type ValidatorContext<T> = { value: T };
type Validator<T> = (context: ValidatorContext<T>) => string | undefined;
type FieldValidationForm = {
  validateField: (field: string, cause: 'submit') => unknown[] | Promise<unknown[]>;
};

export const composeValidators =
  <T>(...validators: Validator<T>[]): Validator<T> =>
  (context) => {
    for (const validator of validators) {
      const error = validator(context);
      if (error) {
        return error;
      }
    }
    return undefined;
  };

export const validateSubmitFields = async (
  form: FieldValidationForm,
  fields: readonly string[],
): Promise<boolean> => {
  const errors = await Promise.all(fields.map((field) => form.validateField(field, 'submit')));
  return errors.flat().length === 0;
};

export const requiredValue =
  (message: string) =>
  ({ value }: { value: unknown }): string | undefined => {
    if (value === null || value === undefined || value === '') {
      return message;
    }
    return undefined;
  };

export const requiredText =
  (message: string) =>
  ({ value }: { value: string }): string | undefined =>
    value.trim().length === 0 ? message : undefined;

export const emailAddress =
  (message: string) =>
  ({ value }: { value: string }): string | undefined =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : message;

export const minTextLength =
  (length: number, message: string) =>
  ({ value }: { value: string }): string | undefined =>
    value.length < length ? message : undefined;

export const maxTextLength =
  (length: number, message: string) =>
  ({ value }: { value: string }): string | undefined =>
    value.length > length ? message : undefined;

export const minNumber =
  (minimum: number, message: string) =>
  ({ value }: { value: number }): string | undefined =>
    Number(value) < minimum ? message : undefined;
