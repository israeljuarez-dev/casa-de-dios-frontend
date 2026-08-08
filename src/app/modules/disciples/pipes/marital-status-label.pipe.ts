import { Pipe, PipeTransform } from '@angular/core';
import { MaritalStatus } from '@modules/disciples/enums/disciple.enums';

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  [MaritalStatus.SINGLE]: 'Soltero/a',
  [MaritalStatus.MARRIED]: 'Casado/a',
  [MaritalStatus.DIVORCED]: 'Divorciado/a',
  [MaritalStatus.WIDOWED]: 'Viudo/a',
  [MaritalStatus.COHABITING]: 'Conviviente',
};

@Pipe({
  name: 'maritalStatusLabel',
  standalone: true,
})
export class MaritalStatusLabelPipe implements PipeTransform {
  transform(value: MaritalStatus): string {
    return MARITAL_STATUS_LABELS[value] ?? value;
  }
}