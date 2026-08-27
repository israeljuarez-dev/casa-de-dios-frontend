import { 
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal 
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CellsService } from '@modules/cells/services/cells.service';
import { ToastService } from '@core/services/toast.service';
import { CellMemberResponse, CellResponse } from '@modules/cells/types/cell-response.types';
import { MeetingDayLabelPipe } from '@modules/cells/pipes/meeting-day-label.pipe';

@Component({
  selector: 'app-move-member-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MeetingDayLabelPipe],
  templateUrl: './move-member-dialog.html',
  styleUrl: './move-member-dialog.css',
})
export class MoveMemberDialog {

  private readonly cellsService = inject(CellsService);
  private readonly toast = inject(ToastService);

  readonly cellId = input.required<number>();
  readonly member = input.required<CellMemberResponse>();
  
  readonly closed = output<void>();
  readonly memberMoved = output<void>();

  readonly searchQuery = signal<string>('');
  readonly selectedCell = signal<CellResponse | null>(null);
  readonly isMoving = signal<boolean>(false);

  readonly cellSearchResults = this.cellsService.cellSearchResults;
  readonly isLoadingCellSearch = this.cellsService.isLoadingCellSearch;

  onSearchInput(query: string): void {
    this.searchQuery.set(query);
    this.cellsService.setCellSearchQuery(query);
    if (!query) this.selectedCell.set(null);
  }

  selectCell(cell: CellResponse): void {
    this.selectedCell.set(cell);
    this.searchQuery.set(cell.name);
    this.cellsService.setCellSearchQuery('');
  }

  confirmMove(): void {
    const targetCell = this.selectedCell();
    if (!targetCell) {
      this.toast.error('Debes seleccionar una célula de destino');
      return;
    }

    this.isMoving.set(true);
    this.cellsService
      .moveMember(this.cellId(), this.member().discipleId, targetCell.id)
      .subscribe({
        next: () => {
          this.toast.success(
            `${this.member().firstName} ${this.member().lastName} movido a ${targetCell.name}`
          );
          this.isMoving.set(false);
          this.memberMoved.emit();
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'No se pudo mover al miembro');
          this.isMoving.set(false);
        },
      });
  }

  close(): void {
    this.closed.emit();
  }
}