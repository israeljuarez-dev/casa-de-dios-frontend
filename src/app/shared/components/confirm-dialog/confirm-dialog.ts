import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  host: {
    '(document:keydown.escape)': 'onEscapePressed()',
  },
})
export class ConfirmDialog {

  isOpen = input.required<boolean>();
  title = input<string>('¿Está seguro?');
  message = input<string>('Esta acción no se puede deshacer.');
  confirmLabel = input<string>('Sí, eliminar');
  cancelLabel = input<string>('Cancelar');
  isLoading = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();

  onEscapePressed(): void {
    if (this.isOpen()) {
      this.cancelled.emit();
    }
  }

  onConfirmClick(): void {
    this.confirmed.emit();
  }

  onCancelClick(): void {
    this.cancelled.emit();
  }
}
