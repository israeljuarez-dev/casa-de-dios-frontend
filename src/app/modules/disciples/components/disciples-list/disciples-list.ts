import { 
  ChangeDetectionStrategy,
  Component, 
  effect, 
  inject, 
  signal 
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DisciplesService } from '@modules/disciples/services/disciples.service';
import { SpiritualLevel } from '@modules/disciples/enums/disciple.enums';
import { DiscipleResponse } from '@modules/disciples/types/disciple-response.types';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { BirthdayStatusPipe } from '@modules/disciples/pipes/birthday-status.pipe';
import { DiscipleForm } from '@modules/disciples/components/disciple-form/disciple-form';
import { computed } from '@angular/core';
import { Select, SelectOption } from '@shared/components/select/select';
import { SPIRITUAL_LEVEL_LABELS } from '@modules/disciples/pipes/spiritual-level-label.pipe';
import { Gender } from '@core/types/gender.types';
import { GENDER_LABELS } from '@modules/disciples/pipes/gender-label.pipe';
import { CardActions } from '@shared/components/card-actions/card-actions';
import { PrimaryButton } from '@shared/components/primary-button/primary-button';
import { SpiritualLevelBadge } from '@shared/components/spiritual-level-badge/spiritual-level-badge';
import { ExportExcelButton } from '@shared/components/export-excel-button/export-excel-button';
import { PageHeader } from '@shared/components/page-header/page-header';
import { SearchInput } from '@shared/components/search-input/search-input';
import { Paginator } from '@shared/components/paginator/paginator';
import { WhatsappButton } from '@shared/components/whatsapp-button/whatsapp-button';

type ListViewState = 'error' | 'initialLoading' | 'empty' | 'ready';

const SEARCH_DEBOUNCE_MS = 400;

@Component({
  selector: 'app-disciples-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, 
    BirthdayStatusPipe,
    ConfirmDialog,
    DiscipleForm,
    Select,
    CardActions,
    PrimaryButton,
    SpiritualLevelBadge,
    ExportExcelButton,
    PageHeader,
    SearchInput,
    Paginator,
    WhatsappButton
  ],
  templateUrl: './disciples-list.html',
  styleUrl: './disciples-list.css',
})
export class DisciplesList {

  private readonly disciplesService = inject(DisciplesService);
  readonly router = inject(Router);

  firstNameFilter = signal<string>('');
  lastNameFilter = signal<string>('');
  genderFilter = signal<Gender | ''>('');
  spiritualLevelFilter = signal<SpiritualLevel | ''>('');
  discipleToDelete = signal<DiscipleResponse | null>(null);
  formMode = signal<'create' | 'edit' | null>(null);
  editingDiscipleId = signal<number | undefined>(undefined);
  isExporting = signal<boolean>(false);
  searchFilter = signal<string>('');

  viewState = computed<ListViewState>(() => {
    if (this.error()) return 'error';
    if (this.isLoading() && this.disciples().length === 0) return 'initialLoading';
    if (this.disciples().length === 0) return 'empty';
    return 'ready';
  });


  private searchDebounceId: ReturnType<typeof setTimeout> | null = null
  spiritualLevels = Object.values(SpiritualLevel);
  disciples = this.disciplesService.disciples;
  pagination = this.disciplesService.pagination;
  isLoading = this.disciplesService.isLoading;
  error = this.disciplesService.error;

  genderOptions: SelectOption<Gender | ''>[] = [
    { label: 'Género', value: '' },
    ...Object.values(Gender).map((g) => ({ label: GENDER_LABELS[g], value: g })),
  ];

  spiritualLevelOptions: SelectOption<SpiritualLevel | ''>[] = [
    { label: 'Nivel espiritual', value: '' },
    ...this.spiritualLevels.map((level) => ({
      label: SPIRITUAL_LEVEL_LABELS[level],
      value: level,
    })),
  ];

  readonly currentCriteria = this.disciplesService.currentCriteria;

  constructor() {
    // Selects: búsqueda inmediata al cambiar — un solo clic, sin riesgo de peticiones múltiples
    effect(() => {
      const gender = this.genderFilter();
      const spiritualLevel = this.spiritualLevelFilter();
      this.disciplesService.updateFilters({
        gender: (gender as Gender) || undefined,
        spiritualLevel: (spiritualLevel as SpiritualLevel) || undefined,
      });
    });
  }

  onSearchChange(value: string): void {
    this.searchFilter.set(value);
    if (this.searchDebounceId) clearTimeout(this.searchDebounceId);
    this.searchDebounceId = setTimeout(() => {
      this.disciplesService.updateFilters({
        search: value.trim() || undefined,
      });
    }, SEARCH_DEBOUNCE_MS);
  }

  applyFilters(): void {
    this.disciplesService.updateFilters({
      firstName: this.firstNameFilter() || undefined,
      lastName: this.lastNameFilter() || undefined,
      gender: (this.genderFilter() as Gender) || undefined,
      spiritualLevel: (this.spiritualLevelFilter() as SpiritualLevel) || undefined,
    });
  }

  goToPage(page: number): void {
    this.disciplesService.goToPage(page);
  }

  formatShortDate(isoDate: string): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const [, month, day] = isoDate.split('-');
    return `${Number(day)} de ${months[Number(month) - 1]}`;
  }

  whatsappLink(disciple: DiscipleResponse): string {
    return `https://wa.me/${disciple.phoneCodeNumber}${disciple.phoneNumber}`;
  }

  requestDelete(disciple: DiscipleResponse): void {
    this.discipleToDelete.set(disciple);
  }

  cancelDelete(): void {
    this.discipleToDelete.set(null);
  }

  confirmDelete(): void {
    const disciple = this.discipleToDelete();
    if (!disciple) return;

    this.disciplesService.delete(disciple.id).subscribe({
      next: () => {
        this.discipleToDelete.set(null);
        this.disciplesService.refresh();
      },
      error: () => {
        this.discipleToDelete.set(null);
      },
    });
  }

  openCreateForm(): void {
    this.editingDiscipleId.set(undefined);
    this.formMode.set('create');
  }

  openEditForm(disciple: DiscipleResponse): void {
    this.editingDiscipleId.set(disciple.id);
    this.formMode.set('edit');
  }

  closeForm(): void {
    this.formMode.set(null);
  }

  onDiscipleSaved(): void {
    this.disciplesService.refresh();
    if (this.formMode() === 'edit') {
      this.formMode.set(null);
    }
  }

  pageNumbers = computed<(number | 'ellipsis')[]>(() => {
    const page = this.pagination();
    if (!page) return [];

    const total = page.totalPages;
    const current = this.currentCriteria().page ?? 1;
    const neighbors = 1;

    const shown: number[] = [];
    for (let i = 1; i <= total; i++) {
      const isFirst = i === 1;
      const isLast = i === total;
      const isNearCurrent = i >= Math.max(1, current - neighbors) && i <= Math.min(total, current + neighbors);
      if (isFirst || isLast || isNearCurrent) {
        shown.push(i);
      }
    }

    const result: (number | 'ellipsis')[] = [];
    let previous: number | null = null;

    for (const pageIndex of shown) {
      if (previous !== null && pageIndex - previous > 1) {
        result.push('ellipsis');
      }
      result.push(pageIndex);
      previous = pageIndex;
    }

    return result;
  });

  goToFirstPage(): void {
    this.disciplesService.goToPage(1);
  }

  goToLastPage(): void {
    const page = this.pagination();
    if (page) {
      this.disciplesService.goToPage(page.totalPages);
    }
  }

  exportExcel(): void {
    this.isExporting.set(true);
    this.disciplesService.exportExcel().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Discipulos_${Date.now()}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
        this.isExporting.set(false);
      },
      error: () => {
        this.isExporting.set(false);
      },
    });
  }
}