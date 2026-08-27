import { 
  ChangeDetectionStrategy,
  Component,
  input 
} from '@angular/core';
import { SpiritualLevel } from '@modules/disciples/enums/disciple.enums';
import { 
  SpiritualLevelBadgeClassPipe 
} from '@modules/disciples/pipes/spiritual-level-badge.pipe';
import { 
  SpiritualLevelLabelPipe 
} from '@modules/disciples/pipes/spiritual-level-label.pipe';

@Component({
  selector: 'app-spiritual-level-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpiritualLevelBadgeClassPipe, SpiritualLevelLabelPipe],
  templateUrl: './spiritual-level-badge.html',
  styleUrl: './spiritual-level-badge.css',
})
export class SpiritualLevelBadge {
  readonly level = input.required<SpiritualLevel>();
}