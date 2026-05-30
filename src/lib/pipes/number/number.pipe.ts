import { Pipe, PipeTransform } from '@angular/core';

const priceFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 1,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

@Pipe({
  name: 'number',
})
export class NumberFormatPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string | null {
    if (value == null || value === '') {
      return null;
    }

    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) {
      return null;
    }

    return priceFormatter.format(num);
  }
}
