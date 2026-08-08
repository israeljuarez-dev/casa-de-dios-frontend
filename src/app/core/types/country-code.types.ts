export interface PhoneFormatRule {
  totalDigits: number;
  groups: number[];
  startsWith?: string[];
}

export interface CountryCode {
  name: string;
  dialCode: string;
  isoCode: string;
  phoneFormat?: PhoneFormatRule;
}