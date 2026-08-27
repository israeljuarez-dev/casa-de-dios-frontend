import { MaritalStatus, SpiritualLevel } from '@modules/disciples/enums/disciple.enums';
import { PaginationCriteria } from '@core/types/pagination.types';
import { Gender } from '@core/types/gender.types';

export interface DiscipleChildRegisterRequest {
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
}

export interface DiscipleChildUpdateRequest {
  id?: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
}

export interface DiscipleRegisterRequest {
  firstName: string;
  lastName: string;
  birthDate: string | null;
  gender: Gender;
  occupation: string | null;
  phoneCodeNumber: string | null;
  phoneNumber: string | null; 
  address: string | null;
  dni: string | null;
  maritalStatus: MaritalStatus;
  coupleName: string | null;
  spiritualLevel: SpiritualLevel;
  isCellGroupLeader: boolean;
  isTeacher: boolean; 
  children: DiscipleChildRegisterRequest[];
  invitedByDiscipleId: number | null;
}

export interface DiscipleUpdateRequest {
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string | null; 
  occupation: string;
  phoneCodeNumber: string | null;
  phoneNumber: string | null;
  address: string | null;
  dni: string | null;
  maritalStatus: MaritalStatus;
  coupleName: string | null;
  spiritualLevel: SpiritualLevel;
  isCellGroupLeader: boolean;
  isTeacher: boolean; 
  children: DiscipleChildUpdateRequest[];
}

export interface DiscipleSearchCriteria extends PaginationCriteria {
  search?: string;  
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  spiritualLevel?: SpiritualLevel;
  maritalStatus?: MaritalStatus;
}