import { 
  Component, 
  ElementRef, 
  HostListener, 
  computed, 
  inject, 
  input, 
  model, 
  signal 
} from '@angular/core';

export interface SelectOption<T> {
  label: string;
  value: T;
  compactLabel?: string;
  imageUrl?: string;
}

const SEARCH_RESET_DELAY_MS = 2500;

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class Select<T> {
  private elementRef = inject(ElementRef<HTMLElement>);
  private searchResetTimeoutId: ReturnType<typeof setTimeout> | null = null;

  options = input.required<SelectOption<T>[]>();
  placeholder = input<string>('Selecciona una opción');
  value = model<T | null>(null);

  isOpen = signal<boolean>(false);
  private searchQuery = signal<string>('');

  selectedOption = computed(() => {
    return this.options().find((option) => option.value === this.value()) ?? null;
  });

  selectedLabel = computed(() => {
    const found = this.selectedOption();
    return found?.compactLabel ?? found?.label ?? this.placeholder();
  });

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.options();
    return this.options().filter((option) => option.label.toLowerCase().includes(query));
  });

  toggle(): void {
    this.isOpen.update((open) => !open);
    if (!this.isOpen()) {
      this.resetSearch();
    }
  }

  selectOption(option: SelectOption<T>): void {
    this.value.set(option.value);
    this.isOpen.set(false);
    this.resetSearch();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
      this.resetSearch();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;

    if (event.key === 'Escape') {
      this.isOpen.set(false);
      this.resetSearch();
      return;
    }

    if (event.key === 'Backspace') {
      this.searchQuery.update((current) => current.slice(0, -1));
      this.restartResetTimer();
      return;
    }

    const isSinglePrintableChar = event.key.length === 1;
    if (!isSinglePrintableChar) return;

    this.searchQuery.update((current) => current + event.key);
    this.restartResetTimer();
  }

  private restartResetTimer(): void {
    if (this.searchResetTimeoutId) {
      clearTimeout(this.searchResetTimeoutId);
    }
    this.searchResetTimeoutId = setTimeout(() => this.resetSearch(), SEARCH_RESET_DELAY_MS);
  }

  private resetSearch(): void {
    this.searchQuery.set('');
    if (this.searchResetTimeoutId) {
      clearTimeout(this.searchResetTimeoutId);
      this.searchResetTimeoutId = null;
    }
  }

  pauseSearchReset(): void {
    if (this.searchResetTimeoutId) {
      clearTimeout(this.searchResetTimeoutId);
      this.searchResetTimeoutId = null;
    }
  }
}