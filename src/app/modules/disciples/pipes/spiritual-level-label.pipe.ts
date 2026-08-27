import { Pipe, PipeTransform } from '@angular/core';
import { SpiritualLevel } from '@modules/disciples/enums/disciple.enums';

export const SPIRITUAL_LEVEL_LABELS: Record<SpiritualLevel, string> = {
  [SpiritualLevel.GUEST]: 'Invitado',
  [SpiritualLevel.PRE_RETREAT]: 'Pre - Encuentro',
  [SpiritualLevel.RETREAT]: 'Encuentro',
  [SpiritualLevel.POST_RETREAT]: 'Post - Encuentro',
  [SpiritualLevel.LEADERSHIP_SCHOOL_1]: 'Escuela de Líderes 1',
  [SpiritualLevel.LEADERSHIP_SCHOOL_2]: 'Escuela de Líderes 2',
  [SpiritualLevel.LEADERSHIP_SCHOOL_3]: 'Escuela de Líderes 3',
  [SpiritualLevel.LEADERSHIP_SCHOOL_4]: 'Escuela de Líderes 4',
  [SpiritualLevel.LEADERSHIP_SCHOOL_5]: 'Escuela de Líderes 5',
  [SpiritualLevel.LEADERSHIP_SCHOOL_6]: 'Escuela de Líderes 6',
  [SpiritualLevel.LEADER]: 'Líder'
};

@Pipe({
  name: 'spiritualLevelLabel',
  standalone: true,
})
export class SpiritualLevelLabelPipe implements PipeTransform {
  transform(value: SpiritualLevel): string {
    return SPIRITUAL_LEVEL_LABELS[value] ?? value;
  }
}