import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titlecase',
})
export class TitleCaseFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string | null {
    if (value == null) {
      return null;
    }

    return value.replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
  }
}
