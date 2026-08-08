import { 
  Component, 
  ElementRef, 
  HostListener, 
  computed, 
  inject, 
  model, 
  signal 
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisciplesService } from '@modules/disciples/services/disciples.service';

const SEARCH_DEBOUNCE_MS = 350;
const MIN_SEARCH_LENGTH = 2;

@Component({
  selector: 'app-invited-by-picker',
  imports: [FormsModule],
  templateUrl: './invited-by-picker.html',
  styleUrl: './invited-by-picker.css',
})
export class InvitedByPicker {
  private elementRef = inject(ElementRef<HTMLElement>);
  private disciplesService = inject(DisciplesService);
  private debounceTimeoutId: ReturnType<typeof setTimeout> | null = null;

  discipleId = model<number | null>(null);
  discipleLabel = model<string>('');

  searchText = signal<string>('');
  isOpen = signal<boolean>(false);

  results = this.disciplesService.inviterSearchResults;
  isLoading = this.disciplesService.inviterSearchLoading;

  displayValue = computed(() => (this.isOpen() ? this.searchText() : this.discipleLabel()));

  onFocus(): void {
    this.searchText.set(this.discipleLabel());
    this.isOpen.set(true);
  }

  onInput(value: string): void {
    this.searchText.set(value);

    if (this.debounceTimeoutId) clearTimeout(this.debounceTimeoutId);

    if (value.trim().length < MIN_SEARCH_LENGTH) {
      this.disciplesService.setInviterSearchQuery('');
      return;
    }

    this.debounceTimeoutId = setTimeout(() => {
      this.disciplesService.setInviterSearchQuery(value.trim());
    }, SEARCH_DEBOUNCE_MS);
  }

  selectDisciple(disciple: { id: number; firstName: string; lastName: string }): void {
    this.discipleId.set(disciple.id);
    this.discipleLabel.set(`${disciple.firstName} ${disciple.lastName}`);
    this.searchText.set('');
    this.isOpen.set(false);
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.discipleId.set(null);
    this.discipleLabel.set('');
    this.searchText.set('');
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }
}