import { Pipe, PipeTransform } from '@angular/core';
import { BirthdayAlertResponse } from '@modules/disciples/types/disciple-response.types';

export type BirthdayStatus = 'today' | 'tomorrow' | 'yesterday' | 'none';

@Pipe({
  name: 'birthdayStatus',
  standalone: true,
})
export class BirthdayStatusPipe implements PipeTransform {
  transform(alert: BirthdayAlertResponse): BirthdayStatus {
    if (alert.isToday) return 'today';
    if (alert.isTomorrow) return 'tomorrow';
    if (alert.wasYesterday) return 'yesterday';
    return 'none';
  }
}