import { 
  ChangeDetectionStrategy,
  Component,
  input,
  output 
} from '@angular/core';

@Component({
  selector: 'app-card-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './card-actions.html',
  styleUrl: './card-actions.css',
})
export class CardActions {

  readonly showView = input<boolean>(true);
  readonly showEdit = input<boolean>(true);
  readonly showDelete = input<boolean>(true);
  readonly viewLabel = input<string>('Ver');
  readonly editLabel = input<string>('Editar');
  readonly deleteLabel = input<string>('Eliminar');

  readonly view   = output<void>();
  readonly edit   = output<void>();
  readonly delete = output<void>();
}