import { Pipe, PipeTransform } from '@angular/core';
import { Gender } from '@core/types/gender.types';

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: 'Masculino',
  [Gender.FEMALE]: 'Femenino',
};

@Pipe({
  name: 'genderLabel',
  standalone: true,
})
export class GenderLabelPipe implements PipeTransform {
  transform(value: Gender): string {
    return GENDER_LABELS[value] ?? value;
  }
}