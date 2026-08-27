import { 
  ChangeDetectionStrategy,
  Component,
  input 
} from '@angular/core';

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeader {
  title = input.required<string>();
  subtitle = input<string>('');
}