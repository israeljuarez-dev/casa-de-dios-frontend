import { Gender } from '@core/types/gender.types';
import { MaritalStatus, SpiritualLevel } from '@modules/disciples/enums/disciple.enums';

export interface BirthdayAlertResponse {
  isToday: boolean;
  isTomorrow: boolean;
  wasYesterday: boolean;
  withinCurrentMonth: boolean;
  withinCurrentWeek: boolean;
  daysUntilNextBirthday: number;
  nextBirthday: string;
  dayOfWeek: string;
}

export interface DiscipleChildResponse {
  id: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
  age: number;
}

export interface DiscipleInviterResponse {
  id: number;
  firstName: string;
  lastName: string;
}

export interface DiscipleParentResponse {
  id: number;
  firstName: string;
  lastName: string;
  gender: Gender;
}
export interface DiscipleResponse {
  id: number;
  firstName: string;
  lastName: string;
   gender: Gender;
  birthDate: string;
  age: number;
  occupation: string;
  phoneCodeNumber: string;
  phoneNumber: string;
  address: string;
  dni: string;
  maritalStatus: MaritalStatus;
  coupleName: string | null;
  spiritualLevel: SpiritualLevel;
  isLeader: boolean;
  hasChildren: boolean;
  children: DiscipleChildResponse[];
  birthdayAlert: BirthdayAlertResponse;
  invitedBy: DiscipleInviterResponse | null;
  parents: DiscipleParentResponse[];
}