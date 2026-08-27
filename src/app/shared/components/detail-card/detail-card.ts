import { 
  ChangeDetectionStrategy,
  Component,
  input 
} from '@angular/core';

@Component({
  selector: 'app-detail-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './detail-card.html',
  styleUrl: './detail-card.css',
})
export class DetailCard {
  title = input.required<string>();
  icon = input<string>('');
}