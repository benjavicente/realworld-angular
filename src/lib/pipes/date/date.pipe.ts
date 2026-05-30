import { Pipe, PipeTransform } from '@angular/core';

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'short' });

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDateValue(value: string | Date, format: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${String(value)}`);
  }

  const day = pad2(date.getDate());
  const month = monthFormatter.format(date);
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());

  switch (format) {
    case 'dd MMM yyyy, HH:mm':
      return `${day} ${month} ${date.getFullYear()}, ${hours}:${minutes}`;
    case 'dd MMM, HH:mm':
      return `${day} ${month}, ${hours}:${minutes}`;
    default:
      throw new Error(`Unsupported date format: ${format}`);
  }
}

@Pipe({
  name: 'date',
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format?: string): string | null {
    if (value == null || value === '' || !format) {
      return null;
    }

    return formatDateValue(value, format);
  }
}
