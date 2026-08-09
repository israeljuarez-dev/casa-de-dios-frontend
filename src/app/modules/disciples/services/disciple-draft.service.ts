import { Service } from '@angular/core';
import { Gender } from '@core/types/gender.types';
import { MaritalStatus, SpiritualLevel } from '@modules/disciples/enums/disciple.enums';

const DRAFT_STORAGE_KEY = 'casa_de_dios_disciple_draft';

// Incrementar este número cada vez que cambie la estructura del formulario
const DRAFT_VERSION = 2;

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
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
      version: DRAFT_VERSION,
      ...draft,
    }));
  }

  load(): DiscipleDraft | null {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Si la versión no coincide, descartar el draft silenciosamente
    if (parsed.version !== DRAFT_VERSION) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }

    return parsed;
  }

  clear(): void {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }
}