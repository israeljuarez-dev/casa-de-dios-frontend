import { Service } from '@angular/core';
import { Gender } from '@core/types/gender.types';
import { MaritalStatus, SpiritualLevel } from '@modules/disciples/enums/disciple.enums';

const DRAFT_STORAGE_KEY = 'casa_de_dios_disciple_draft';

export interface DiscipleDraftChild {
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
}

export interface DiscipleDraft {
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
  dni: string;
  occupation: string;
  phoneCodeNumber: string;
  phoneNumber: string;
  address: string;
  maritalStatus: MaritalStatus;
  coupleName: string;
  spiritualLevel: SpiritualLevel;
  isLeader: boolean;
  invitedByDiscipleId: number | null;
  invitedByLabel: string;
  hasChildren: boolean;
  children: DiscipleDraftChild[];
}

@Service()
export class DiscipleDraftService {
  save(draft: DiscipleDraft): void {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }

  load(): DiscipleDraft | null {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }
}