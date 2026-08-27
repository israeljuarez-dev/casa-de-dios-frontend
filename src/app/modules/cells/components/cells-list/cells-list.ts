import { 
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal 
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CellsService } from '@modules/cells/services/cells.service';
import { CellResponse } from '@modules/cells/types/cell-response.types';
import { MeetingDay } from '@modules/cells/enums/cell.enums';
import { CellFormDrawer } from '@modules/cells/components/cell-form-drawer/cell-form-drawer';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { ToastService } from '@core/services/toast.service';
import { Select, SelectOption } from '@shared/components/select/select';
import { MEETING_DAY_LABELS } from '@modules/cells/pipes/meeting-day-label.pipe';
import { AuthService } from '@modules/auth/services/auth.service';
import { PrimaryButton } from '@shared/components/primary-button/primary-button';
import { ExportExcelButton } from '@shared/components/export-excel-button/export-excel-button';
import { CellCard } from '@modules/cells/components/cell-card/cell-card';
import { PageHeader } from '@shared/components/page-header/page-header';
import { SearchInput } from '@shared/components/search-input/search-input';
import { Paginator } from '@shared/components/paginator/paginator';

@Component({
  selector: 'app-cells-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    CellFormDrawer,
    ConfirmDialog,
    Select,
    PrimaryButton,
    ExportExcelButton,
    CellCard,
    PageHeader,
    SearchInput,
    Paginator,
  ],
  templateUrl: './cells-list.html',
  styleUrl: './cells-list.css',
})
export class CellsList {

  private readonly router = inject(Router);
  private readonly cellsService = inject(CellsService);
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);

  readonly isExporting = signal<boolean>(false);
  readonly nameFilter = signal<string>('');
  readonly leaderFilter = signal<string>('');
  readonly meetingDayFilter = signal<MeetingDay | ''>('');
  readonly showFormDrawer = signal<boolean>(false);
  readonly cellToEdit = signal<CellResponse | null>(null);
  readonly cellToDelete = signal<CellResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly pageNumbers = computed<(number | 'ellipsis')[]>(() => {
    const page = this.pagination();
    if (!page) return [];

    const total = page.totalPages;
    const current = this.currentCriteria().page ?? 1;
    const neighbors = 1;

    const shown: number[] = [];
    for (let i = 1; i <= total; i++) {
      const isFirst = i === 1;
      const isLast = i === total;
      const isNearCurrent =
        i >= Math.max(1, current - neighbors) &&
        i <= Math.min(total, current + neighbors);
      if (isFirst || isLast || isNearCurrent) shown.push(i);
    }

    const result: (number | 'ellipsis')[] = [];
    let previous: number | null = null;
    for (const pageIndex of shown) {
      if (previous !== null && pageIndex - previous > 1) result.push('ellipsis');
      result.push(pageIndex);
      previous = pageIndex;
    }
    return result;
  });

  readonly currentUserGender = computed(() => this.authService.currentUser()?.gender ?? null);

  readonly cells = this.cellsService.cells;
  readonly pagination = this.cellsService.pagination;
  readonly isLoading = this.cellsService.isLoading;
  readonly currentCriteria = this.cellsService.currentCriteria;
  readonly meetingDays = Object.values(MeetingDay);
  readonly MeetingDay = MeetingDay;

  readonly meetingDayOptions: SelectOption<MeetingDay | ''>[] = [
    { label: 'Día de reunión', value: '' },
    ...Object.values(MeetingDay).map((day) => ({
      label: MEETING_DAY_LABELS[day],
      value: day,
    })),
  ];

  navigateToDetail(id: number): void {
    this.router.navigate(['/cell-groups', id]);
  }

  openCreateDrawer(): void {
    this.cellToEdit.set(null);
    this.showFormDrawer.set(true);
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
    this.cellsService.refresh();
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
        this.cellsService.refresh();
      },
      error: () => {
        this.toast.error('No se pudo eliminar la célula');
        this.isDeleting.set(false);
      },
    });
  }

  applyFilters(): void {
    this.cellsService.updateFilters({
      name: this.nameFilter() || undefined,
      leaderName: this.leaderFilter() || undefined,
      meetingDay: (this.meetingDayFilter() as MeetingDay) || undefined,
    });
  }

  exportExcel(): void {
    this.isExporting.set(true);
    this.cellsService.exportExcel().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Celulas_${Date.now()}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.isExporting.set(false);
      },
      error: () => {
        this.toast.error('No se pudo exportar el archivo');
        this.isExporting.set(false);
      },
    });
  }

  goToPage(page: number): void {
    this.cellsService.goToPage(page);
  }

  goToFirstPage(): void {
    this.cellsService.goToPage(1);
  }

  goToLastPage(): void {
    const page = this.pagination();
    if (page) this.cellsService.goToPage(page.totalPages);
  }

  getShowingEnd(): number {
    const page = this.currentCriteria().page ?? 1;
    const size = this.currentCriteria().size ?? 10;
    const total = this.pagination()?.totalElements ?? 0;
    return Math.min(page * size, total);
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  onMeetingDayChange(value: MeetingDay | '' | null): void {
    this.meetingDayFilter.set((value ?? '') as MeetingDay | '');
    this.applyFilters();
  }

  navigateToPastorCells(): void {
    this.router.navigate(['/cell-groups/pastor']);
  }
}