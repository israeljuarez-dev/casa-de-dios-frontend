import { 
  ChangeDetectionStrategy,
  Component,
  input,
  model 
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './toggle.html',
  styleUrl: './toggle.css',
})
export class Toggle {
  disabled = input<boolean>(false);
  
  value = model<boolean>(false);
}