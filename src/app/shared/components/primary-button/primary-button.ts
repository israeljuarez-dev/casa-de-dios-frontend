import { 
  ChangeDetectionStrategy,
  Component,
  input,
  output 
} from '@angular/core';

@Component({
  selector: 'app-primary-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './primary-button.html',
  styleUrl: './primary-button.css',
})
export class PrimaryButton {
  readonly label = input.required<string>();
  readonly icon = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly clicked = output<void>();
}