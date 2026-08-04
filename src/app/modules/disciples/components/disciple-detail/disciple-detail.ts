import { 
  Component, 
  computed, 
  effect, 
  inject, 
  input,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DisciplesService } from '@modules/disciples/services/disciples.service';
import { SpiritualLevelLabelPipe } from '@modules/disciples/pipes/spiritual-level-label.pipe';
import { MaritalStatusLabelPipe } from '@modules/disciples/pipes/marital-status-label.pipe';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-disciple-detail',
  imports: [
    RouterLink, 
    SpiritualLevelLabelPipe, 
    MaritalStatusLabelPipe,
    ConfirmDialog,
  ],
  templateUrl: './disciple-detail.html',
  styleUrl: './disciple-detail.css',
})
export class DiscipleDetail {

  private disciplesService = inject(DisciplesService);

  private router = inject(Router);

  id = input.required<string>();

  disciple = this.disciplesService.disciple;

  isLoading = this.disciplesService.isLoadingDisciple;

  error = this.disciplesService.discipleError;

  showDeleteConfirm = signal<boolean>(false);

  fullName = computed(() => {
    const d = this.disciple();
    return d ? `${d.firstName} ${d.lastName}` : '';
  });

  formattedBirthDate = computed(() => {
    const d = this.disciple();
    if (!d) return '';
    
    const months = [
      'enero', 
      'febrero', 
      'marzo', 
      'abril', 
      'mayo', 
      'junio',
      'julio', 
      'agosto', 
      'septiembre', 
      'octubre', 
      'noviembre', 
      'diciembre',
    ];

    const [year, month, day] = d.birthDate.split('-');

    return `${Number(day)} de ${months[Number(month) - 1]}, ${year} (${d.age} años)`;
  });

  constructor() {
    effect(() => {
      this.disciplesService.selectDisciple(Number(this.id()));
    });
  }

  whatsappLink(): string {
    const d = this.disciple();
    return d ? `https://wa.me/${d.phoneCodeNumber}${d.phoneNumber}` : '';
  }

  formatChildBirthDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }

  confirmDelete(): void {
    const d = this.disciple();
    if (!d) return;

    this.disciplesService.delete(d.id).subscribe({
      next: () => {
        this.disciplesService.refresh();
        this.router.navigate(['/disciples']);
      },
      error: () => {
        this.showDeleteConfirm.set(false);
      },
    });
  }
}