import { 
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  model,
  signal
} from '@angular/core';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

@Component({
  selector: 'app-time-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './time-picker.html',
  styleUrl: './time-picker.css',
})
export class TimePicker {

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly isOpen = signal(false);

  value = model<string | null>(null);

  readonly hours = HOURS;
  readonly minutes = MINUTES;

  readonly selectedHour = computed(() => this.value()?.split(':')[0] ?? null);
  readonly selectedMinute = computed(() => this.value()?.split(':')[1] ?? null);
  readonly displayLabel = computed(() => {
    const v = this.value();
    return v ? v : 'Sin definir';
  });

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  selectHour(hour: string): void {
    const minute = this.selectedMinute() ?? '00';
    this.value.set(`${hour}:${minute}`);
  }

  selectMinute(minute: string): void {
    const hour = this.selectedHour() ?? '00';
    this.value.set(`${hour}:${minute}`);
    this.isOpen.set(false);
  }

  clear(): void {
    this.value.set(null);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }
}