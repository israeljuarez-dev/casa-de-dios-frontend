import { Pipe, PipeTransform } from '@angular/core';
import { MeetingDay } from '@modules/cells/enums/cell.enums';

export const MEETING_DAY_LABELS: Record<MeetingDay, string> = {
  [MeetingDay.MONDAY]:    'Lunes',
  [MeetingDay.TUESDAY]:   'Martes',
  [MeetingDay.WEDNESDAY]: 'Miércoles',
  [MeetingDay.FRIDAY]:    'Viernes',
  [MeetingDay.SATURDAY]:  'Sábado',
};

@Pipe({
  name: 'meetingDayLabel',
  standalone: true,
})
export class MeetingDayLabelPipe implements PipeTransform {
  transform(value: MeetingDay | null): string {
    if (!value) return '—';
    return MEETING_DAY_LABELS[value] ?? value;
  }
}