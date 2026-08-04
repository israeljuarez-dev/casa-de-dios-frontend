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

@Component({
  selector: 'app-disciples-list',
  imports: [
    FormsModule, 
    RouterLink, 
    SpiritualLevelLabelPipe,
    SpiritualLevelBadgeClassPipe,
    BirthdayStatusPipe,
    ConfirmDialog,
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

  spiritualLevelFilter = signal<SpiritualLevel | ''>('');

  discipleToDelete = signal<DiscipleResponse | null>(null);

  applyFilters(): void {
    this.disciplesService.updateFilters({
      firstName: this.firstNameFilter() || undefined,
      lastName: this.lastNameFilter() || undefined,
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
}