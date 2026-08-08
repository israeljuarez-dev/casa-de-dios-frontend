import { 
  Component, 
  computed, 
  viewChild,
  effect, 
  model, 
  output,
  signal,
  ElementRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select, SelectOption } from '@shared/components/select/select';
import { COUNTRY_CODES } from '@shared/data/country-codes.data';
import { CountryCode } from '@core/types/country-code.types';

@Component({
  selector: 'app-phone-input',
  imports: [
    FormsModule, 
    Select,
  ],
  templateUrl: './phone-input.html',
  styleUrl: './phone-input.css',
})
export class PhoneInput {
  
  hasLetters = signal<boolean>(false);

  hasReachedLimit = signal<boolean>(false);

  private letterWarningTimeoutId: ReturnType<typeof setTimeout> | null = null;

  dialCode = model<string>('51');
  phoneNumber = model<string>('');

  validityChange = output<boolean>();

  validationMessage = computed(() => {
    const digits = this.phoneNumber();
    const format = this.selectedCountry()?.phoneFormat;
    if (!digits || !format) return null;

    const hasCorrectLength = digits.length === format.totalDigits;
    const hasValidPrefix = !format.startsWith || format.startsWith.includes(digits[0]);

    if (hasCorrectLength && hasValidPrefix) return null;

    if (!hasCorrectLength) {
      return `El número debe tener exactamente ${format.totalDigits} dígitos.`;
    }

    if (!hasValidPrefix && format.startsWith) {
      const prefixes = format.startsWith.join(' o ');
      return `El número debe empezar con ${prefixes}.`;
    }

    return null;
  });

  phoneInputRef = viewChild<ElementRef<HTMLInputElement>>('phoneInputRef');

  countryOptions: SelectOption<string>[] = COUNTRY_CODES.map((country) => ({
    label: `+${country.dialCode} · ${country.name}`,
    compactLabel: `+${country.dialCode}`,
    value: country.dialCode,
    imageUrl: `https://flagcdn.com/24x18/${country.isoCode}.png`,
  }));

  selectedCountry = computed<CountryCode | null>(() => {
    return COUNTRY_CODES.find((country) => country.dialCode === this.dialCode()) ?? null;
  });

  placeholder = computed(() => {
    const format = this.selectedCountry()?.phoneFormat;
    if (!format) return 'Número de celular';
    return format.groups.map((size) => '9'.repeat(size)).join(' ');
  });

  expectedDigits = computed(() => this.selectedCountry()?.phoneFormat?.totalDigits ?? null);

  displayValue = computed(() => {
    const digits = this.phoneNumber();
    const groups = this.selectedCountry()?.phoneFormat?.groups;
    if (!groups) return digits;
    return this.applyGrouping(digits, groups);
  });

  isValid = computed(() => {
    const digits = this.phoneNumber();
    const format = this.selectedCountry()?.phoneFormat;
    if (!digits) return true;
    if (!format) return digits.length >= 6 && digits.length <= 15;

    const hasCorrectLength = digits.length === format.totalDigits;
    const hasValidPrefix = !format.startsWith || format.startsWith.includes(digits[0]);
    return hasCorrectLength && hasValidPrefix;
  });

  constructor() {
    effect(() => {
      this.validityChange.emit(this.isValid());
    });
  }

  onPhoneNumberInput(rawValue: string): void {
    const inputElement = this.phoneInputRef()?.nativeElement;
    const cursorPosition = inputElement?.selectionStart ?? rawValue.length;
    const digitsBeforeCursor = rawValue.slice(0, cursorPosition).replace(/\D/g, '').length;

    const digitsOnly = rawValue.replace(/\D/g, '');
    const maxDigits = this.selectedCountry()?.phoneFormat?.totalDigits ?? 15;

    // Detectar letras
    const nonDigitNonSpace = rawValue.replace(/[\d\s]/g, '');
    if (nonDigitNonSpace.length > 0) {
      this.hasLetters.set(true);
      if (this.letterWarningTimeoutId) clearTimeout(this.letterWarningTimeoutId);
      this.letterWarningTimeoutId = setTimeout(() => this.hasLetters.set(false), 2000);
    } else {
      this.hasLetters.set(false);
    }

    // Detectar límite — se mantiene activo mientras siga al máximo de dígitos
    // Se apaga solo cuando el usuario borra y queda por debajo del límite
    if (digitsOnly.length > maxDigits) {
      this.hasReachedLimit.set(true);
    } else {
      // Apagar el aviso en cuanto el número ya está dentro del límite
      this.hasReachedLimit.set(false);
    }

    this.phoneNumber.set(digitsOnly.slice(0, maxDigits));

    requestAnimationFrame(() => {
      const element = this.phoneInputRef()?.nativeElement;
      if (!element) return;
      const groups = this.selectedCountry()?.phoneFormat?.groups;
      const newPosition = this.calculateCursorPosition(digitsBeforeCursor, groups);
      element.setSelectionRange(newPosition, newPosition);
    });
  }

  private calculateCursorPosition(digitsBeforeCursor: number, groups: number[] | undefined): number {
    if (!groups) return digitsBeforeCursor;

    let position = 0;
    let digitsCounted = 0;

    for (const groupSize of groups) {
      if (digitsCounted >= digitsBeforeCursor) break;
      const digitsInThisGroup = Math.min(groupSize, digitsBeforeCursor - digitsCounted);
      position += digitsInThisGroup;
      digitsCounted += digitsInThisGroup;
      if (digitsCounted < digitsBeforeCursor) position += 1;
    }

    return position;
  }

  private applyGrouping(digits: string, groups: number[]): string {
    const parts: string[] = [];
    let index = 0;
    for (const size of groups) {
      if (index >= digits.length) break;
      parts.push(digits.slice(index, index + size));
      index += size;
    }
    return parts.join(' ');
  }
}