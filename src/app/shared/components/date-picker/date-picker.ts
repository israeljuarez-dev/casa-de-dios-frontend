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
import { Select, SelectOption } from '@shared/components/select/select';

interface CalendarDay {
  iso: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

const WEEKDAY_LABELS = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

@Component({
  selector: 'app-date-picker',
  imports: [Select],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
})
export class DatePicker {
  private elementRef = inject(ElementRef<HTMLElement>);

  value = model<string>('');
  maxDate = input<string>('');
  minDate = input<string>('');
  placeholder = input<string>('dd/mm/aaaa');
  minYear = input<number>(1920);

  isOpen = signal<boolean>(false);
  weekdayLabels = WEEKDAY_LABELS;

  private today = new Date();
  viewYear = signal<number>(this.today.getFullYear());
  viewMonth = signal<number>(this.today.getMonth());

  monthOptions: SelectOption<number>[] = MONTH_LABELS.map((label, index) => ({ label, value: index }));

  yearOptions = computed<SelectOption<number>[]>(() => {
    const max = this.today.getFullYear();
    const min = this.minYear();
    const years: SelectOption<number>[] = [];
    // Modificado: orden ascendente — años más antiguos arriba, más útil para discípulos mayores
    for (let year = min; year <= max; year++) {
      years.push({ label: String(year), value: year });
    }
    return years;
  });

  displayValue = computed(() => {
    const iso = this.value();
    if (!iso) return '';
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  });

  calendarDays = computed<CalendarDay[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startOffset = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayIso = this.toIso(this.today);
    const selectedIso = this.value();
    const max = this.maxDate();
    const min = this.minDate();

    const days: CalendarDay[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNumber = daysInPrevMonth - i;
      const date = new Date(year, month - 1, dayNumber);
      days.push(this.buildDay(date, false, todayIso, selectedIso, min, max));
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      const date = new Date(year, month, dayNumber);
      days.push(this.buildDay(date, true, todayIso, selectedIso, min, max));
    }

    const remaining = 42 - days.length;
    for (let dayNumber = 1; dayNumber <= remaining; dayNumber++) {
      const date = new Date(year, month + 1, dayNumber);
      days.push(this.buildDay(date, false, todayIso, selectedIso, min, max));
    }

    return days;
  });

  toggle(): void {
    this.isOpen.update((open) => !open);
    if (this.isOpen() && this.value()) {
      const [year, month] = this.value().split('-').map(Number);
      this.viewYear.set(year);
      this.viewMonth.set(month - 1);
    }
  }

  onMonthChange(month: number | null): void {
    if (month !== null) this.viewMonth.set(month);
  }

  onYearChange(year: number | null): void {
    if (year !== null) this.viewYear.set(year);
  }

  selectDay(day: CalendarDay): void {
    if (day.isDisabled) return;
    this.value.set(day.iso);
    // NUEVO: ya no cerramos el calendario aquí, se queda abierto
  }

  selectToday(): void {
    const iso = this.toIso(this.today);
    this.value.set(iso);
    this.viewYear.set(this.today.getFullYear());
    this.viewMonth.set(this.today.getMonth());
  }

  clearValue(): void {
    this.value.set('');
  }

  close(): void {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }

  private buildDay(
    date: Date,
    inCurrentMonth: boolean,
    todayIso: string,
    selectedIso: string,
    min: string,
    max: string
  ): CalendarDay {
    const iso = this.toIso(date);
    const isDisabled = (!!min && iso < min) || (!!max && iso > max);
    return {
      iso,
      dayNumber: date.getDate(),
      inCurrentMonth,
      isToday: iso === todayIso,
      isSelected: iso === selectedIso,
      isDisabled,
    };
  }

  private toIso(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}