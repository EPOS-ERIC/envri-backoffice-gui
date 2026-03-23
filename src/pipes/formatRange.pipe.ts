/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';
import { formatRangeText } from 'src/helpers/strings';

@Pipe({ name: 'formatRange' })
export class FormatRangePipe implements PipeTransform {
  transform(value: any) {
    return formatRangeText(value);
  }
}
