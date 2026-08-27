import { 
  ChangeDetectionStrategy,
  Component,
  input,
  output 
} from '@angular/core';

@Component({
  selector: 'app-back-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './back-button.html',
  styleUrl: './back-button.css',
})
export class BackButton {
  readonly label = input<string>('Volver al listado');
  
  readonly back = output<void>();
}