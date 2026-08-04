import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { COUNTRY_CODES } from '@shared/data/country-codes.data';

@Component({
  selector: 'app-phone-input',
  imports: [FormsModule],
  templateUrl: './phone-input.html',
  styleUrl: './phone-input.css',
})
export class PhoneInput {
  dialCode = model<string>('51');
  phoneNumber = model<string>('');

  countries = COUNTRY_CODES;
}