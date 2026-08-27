import { 
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal 
} from '@angular/core';
import { Router } from '@angular/router';
import { CellResponse, CellMemberResponse } from '@modules/cells/types/cell-response.types';
import { CellsService } from '@modules/cells/services/cells.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { MeetingDayLabelPipe } from '@modules/cells/pipes/meeting-day-label.pipe';
import { AddMemberDrawer } from '@modules/cells/components/add-member-drawer/add-member-drawer';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { Gender } from '@core/types/gender.types';
import { CardActions } from '@shared/components/card-actions/card-actions';
import { CellFormDrawer } from '@modules/cells/components/cell-form-drawer/cell-form-drawer';
import { BackButton } from '@shared/components/back-button/back-button';
import { PrimaryButton } from '@shared/components/primary-button/primary-button';

@Component({
  selector: 'app-pastor-cells',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MeetingDayLabelPipe,
    AddMemberDrawer,
    ConfirmDialog,
    CardActions,
    CellFormDrawer,
    BackButton,
    PrimaryButton,
  ],
  templateUrl: './pastor-cells.html',
  styleUrl: './pastor-cells.css',
})
export class PastorCells {

  private readonly router = inject(Router);
  private readonly cellsService = inject(CellsService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly cellToEdit = signal<CellResponse | null>(null);
  readonly showFormDrawer = signal<boolean>(false);
  readonly cellToDelete = signal<CellResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);
  readonly memberToRemove = signal<{ member: CellMemberResponse; cellId: number } | null>(null);
  readonly isRemoving = signal<boolean>(false);
  readonly showAddMemberDrawer = signal<boolean>(false);
  readonly addingToCellId = signal<number | null>(null);

  readonly currentUserGender = computed(() => this.authService.currentUser()?.gender ?? null);

  
  readonly membersCell1 = this.cellsService.pastorMembersCell1;
  readonly membersCell2 = this.cellsService.pastorMembersCell2;
  readonly isLoadingMembers1 = this.cellsService.isLoadingPastorMembersCell1;
  readonly isLoadingMembers2 = this.cellsService.isLoadingPastorMembersCell2;

  readonly pastorCells = this.cellsService.pastorCells;
  readonly isLoading = this.cellsService.isLoadingPastorCells;
  readonly Gender = Gender;

  goBack(): void {
    this.router.navigate(['/cell-groups']);
  }

  openAddMemberDrawer(cellId: number): void {
    this.addingToCellId.set(cellId);
    this.showAddMemberDrawer.set(true);
  }

  closeAddMemberDrawer(): void {
    this.showAddMemberDrawer.set(false);
    this.addingToCellId.set(null);
  }

  onMemberAdded(): void {
    this.closeAddMemberDrawer();
    this.cellsService.reloadPastorCells();
    this.cellsService.reloadPastorMembers();
  }

  confirmRemoveMember(member: CellMemberResponse, cellId: number): void {
    this.memberToRemove.set({ member, cellId });
  }

  cancelRemove(): void {
    this.memberToRemove.set(null);
  }

  executeRemove(): void {
    const data = this.memberToRemove();
    if (!data) return;

    this.isRemoving.set(true);
    this.cellsService.removeMember(data.cellId, data.member.discipleId).subscribe({
      next: () => {
        this.toast.success('Miembro removido exitosamente');
        this.memberToRemove.set(null);
        this.isRemoving.set(false);
        this.cellsService.reloadPastorCells();
        this.cellsService.reloadPastorMembers();
      },
      error: () => {
        this.toast.error('No se pudo remover al miembro');
        this.isRemoving.set(false);
      },
    });
  }

  getMembersForCell(index: number): CellMemberResponse[] {
    return index === 0 ? this.membersCell1() : this.membersCell2();
  }

  isLoadingMembersForCell(index: number): boolean {
    return index === 0 ? this.isLoadingMembers1() : this.isLoadingMembers2();
  }

  isMyCell(cell: CellResponse): boolean {
    return cell.pastorCellGender === this.currentUserGender();
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/cell-groups', id], { queryParams: { from: 'pastor' } });
  }

  openEditDrawer(cell: CellResponse): void {
    this.cellToEdit.set(cell);
    this.showFormDrawer.set(true);
  }

  closeFormDrawer(): void {
    this.showFormDrawer.set(false);
    this.cellToEdit.set(null);
  }

  onFormSuccess(): void {
    this.closeFormDrawer();
    this.cellsService.reloadPastorCells();
  }

  confirmDelete(cell: CellResponse): void {
    this.cellToDelete.set(cell);
  }

  cancelDelete(): void {
    this.cellToDelete.set(null);
  }

  executeDelete(): void {
    const cell = this.cellToDelete();
    if (!cell) return;

    this.isDeleting.set(true);
    this.cellsService.delete(cell.id).subscribe({
      next: () => {
        this.toast.success('Célula eliminada exitosamente');
        this.cellToDelete.set(null);
        this.isDeleting.set(false);
        this.cellsService.reloadPastorCells();
      },
      error: () => {
        this.toast.error('No se pudo eliminar la célula');
        this.isDeleting.set(false);
      },
    });
  }
}