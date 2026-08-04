import { Pipe, PipeTransform } from '@angular/core';
import { SpiritualLevel } from '@modules/disciples/enums/disciple.enums';

const SPIRITUAL_LEVEL_BADGE_CLASSES: Record<SpiritualLevel, string> = {
  [SpiritualLevel.GUEST]: 'bg-warning/15 text-warning',
  [SpiritualLevel.PRE_RETREAT]: 'bg-info/15 text-info',
  [SpiritualLevel.RETREAT]: 'bg-info/15 text-info',
  [SpiritualLevel.POST_RETREAT]: 'bg-info/15 text-info',
  [SpiritualLevel.LEADERSHIP_SCHOOL_1]: 'bg-school/15 text-school',
  [SpiritualLevel.LEADERSHIP_SCHOOL_2]: 'bg-school/15 text-school',
  [SpiritualLevel.LEADERSHIP_SCHOOL_3]: 'bg-school/15 text-school',
  [SpiritualLevel.LEADERSHIP_SCHOOL_4]: 'bg-school/15 text-school',
  [SpiritualLevel.LEADERSHIP_SCHOOL_5]: 'bg-school/15 text-school',
  [SpiritualLevel.LEADERSHIP_SCHOOL_6]: 'bg-school/15 text-school',
  [SpiritualLevel.LEADERSHIP_SCHOOL_TEACHER]: 'bg-school/15 text-school',
  [SpiritualLevel.LEADER]: 'bg-error/15 text-error',
  [SpiritualLevel.CELL_LEADER]: 'bg-error/15 text-error',
};

@Pipe({
  name: 'spiritualLevelBadgeClass',
  standalone: true,
})
export class SpiritualLevelBadgeClassPipe implements PipeTransform {
  transform(value: SpiritualLevel): string {
    return SPIRITUAL_LEVEL_BADGE_CLASSES[value] ?? 'bg-surface-container-highest text-on-surface-variant';
  }
}