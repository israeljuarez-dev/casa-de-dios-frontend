import { 
  ChangeDetectionStrategy,
  Component,
  input,
  model 
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './search-input.html',
  styleUrl: './search-input.css',
})
export class SearchInput {
  placeholder = input<string>('Buscar...');
  icon = input<string>('search');
  
  value = model<string>('');
}