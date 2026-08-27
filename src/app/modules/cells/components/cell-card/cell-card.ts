import { 
  ChangeDetectionStrategy,
  Component,
  input,
  output 
} from '@angular/core';
import { CellResponse } from '@modules/cells/types/cell-response.types';
import { MeetingDayLabelPipe } from '@modules/cells/pipes/meeting-day-label.pipe';
import { CardActions } from '@shared/components/card-actions/card-actions';

@Component({
  selector: 'app-cell-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MeetingDayLabelPipe,
    CardActions,
  ],
  templateUrl: './cell-card.html',
  styleUrl: './cell-card.css',
})
export class CellCard {

  cell = input.required<CellResponse>();
  
  view = output<void>();
  edit = output<void>();
  delete = output<void>();
}
