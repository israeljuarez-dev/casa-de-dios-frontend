import { 
  Component, 
  inject, 
  signal 
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DisciplesService } from '@modules/disciples/services/disciples.service';
import { SpiritualLevel } from '@modules/disciples/enums/disciple.enums';
import { DiscipleResponse } from '@modules/disciples/types/disciple-response.types';
import { SpiritualLevelLabelPipe } from '@modules/disciples/pipes/spiritual-level-label.pipe';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { SpiritualLevelBadgeClassPipe } from '@modules/disciples/pipes/spiritual-level-badge.pipe';
import { BirthdayStatusPipe } from '@modules/disciples/pipes/birthday-status.pipe';
import { DiscipleForm } from '@modules/disciples/components/disciple-form/disciple-form';
import { computed } from '@angular/core';
import { Select, SelectOption } from '@shared/components/select/select';
import { SPIRITUAL_LEVEL_LABELS } from '@modules/disciples/pipes/spiritual-level-label.pipe';
import { Gender } from '@core/types/gender.types';
import { GENDER_LABELS } from '@modules/disciples/pipes/gender-label.pipe';

type ListViewState = 'error' | 'initialLoading' | 'empty' | 'ready';

@Component({
  selector: 'app-disciples-list',
  imports: [
    FormsModule, 
    RouterLink, 
    SpiritualLevelLabelPipe,
    SpiritualLevelBadgeClassPipe,
    BirthdayStatusPipe,
    ConfirmDialog,
    DiscipleForm,
    Select
  ],
  templateUrl: './disciples-list.html',
  styleUrl: './disciples-list.css',
})
export class DisciplesList {

  disciplesService = inject(DisciplesService);

  spiritualLevels = Object.values(SpiritualLevel);

  disciples = this.disciplesService.disciples;
  pagination = this.disciplesService.pagination;
  isLoading = this.disciplesService.isLoading;
  error = this.disciplesService.error;

  firstNameFilter = signal('');
  lastNameFilter = signal('');
  genderFilter = signal<Gender | ''>('');
  spiritualLevelFilter = signal<SpiritualLevel | ''>('');
  discipleToDelete = signal<DiscipleResponse | null>(null);

  formMode = signal<'create' | 'edit' | null>(null);
  editingDiscipleId = signal<number | undefined>(undefined);

  viewState = computed<ListViewState>(() => {
    if (this.error()) return 'error';
    if (this.isLoading() && this.disciples().length === 0) return 'initialLoading';
    if (this.disciples().length === 0) return 'empty';
    return 'ready';
  });

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

  applyFilters(): void {
    this.disciplesService.updateFilters({
      firstName: this.firstNameFilter() || undefined,
      lastName: this.lastNameFilter() || undefined,
      gender: (this.genderFilter() as Gender) || undefined,
      spiritualLevel: (this.spiritualLevelFilter() as SpiritualLevel) || undefined,
    });
  }

  goToPage(page: number): void {
    this.preserveScrollPosition(() => this.disciplesService.goToPage(page));
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
    const current = page.currentPage;
    const neighbors = 1;

    const shown: number[] = [];
    for (let i = 0; i < total; i++) {
      const isFirst = i === 0;
      const isLast = i === total - 1;
      const isNearCurrent = i >= current - neighbors && i <= current + neighbors;
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
    this.preserveScrollPosition(() => this.disciplesService.goToPage(0));
  }

  goToLastPage(): void {
    const page = this.pagination();
    if (page) {
      this.preserveScrollPosition(() => this.disciplesService.goToPage(page.totalPages - 1));
    }
  }

  private preserveScrollPosition(action: () => void): void {
    const scrollY = window.scrollY;
    action();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY });
      });
    });
  }

}