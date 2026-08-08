import { 
  Component, 
  computed, 
  effect, 
  inject, 
  input, 
  output, 
  signal 
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisciplesService } from '@modules/disciples/services/disciples.service';
import { 
  MaritalStatus, 
  SpiritualLevel 
} from '@modules/disciples/enums/disciple.enums';
import { PhoneInput } from '@shared/components/phone-input/phone-input';
import { DatePicker } from '@shared/components/date-picker/date-picker';
import { InvitedByPicker } from '@modules/disciples/components/invited-by-picker/invited-by-picker';
import { DiscipleDraftService } from '@modules/disciples/services/disciple-draft.service';
import { ToastService } from '@core/services/toast.service';
import { ApiErrorResponse } from '@core/types/api-response.types';
import {
  DiscipleChildRegisterRequest,
  DiscipleChildUpdateRequest,
  DiscipleRegisterRequest,
  DiscipleUpdateRequest,
} from '@modules/disciples/types/disciple-request.types';
import { DiscipleResponse } from '@modules/disciples/types/disciple-response.types';
import { Select, SelectOption } from '@shared/components/select/select';
import { MARITAL_STATUS_LABELS } from '@modules/disciples/pipes/marital-status-label.pipe';
import { GENDER_LABELS } from '@modules/disciples/pipes/gender-label.pipe';
import { Gender } from '@core/types/gender.types';
import { SPIRITUAL_LEVEL_LABELS } from '@modules/disciples/pipes/spiritual-level-label.pipe';
import { FormErrorMapperService } from '@shared/services/form-error-mapper.service';

const LEADER_ELIGIBLE_LEVELS: SpiritualLevel[] = [
  SpiritualLevel.LEADER,
  SpiritualLevel.CELL_LEADER,
  SpiritualLevel.LEADERSHIP_SCHOOL_TEACHER,
];

const DRAFT_SAVE_DEBOUNCE_MS = 500;

const FIELD_ERROR_MAP: Record<string, string> = {
  firstName: 'Nombres',
  lastName: 'Apellidos',
  birthDate: 'Fecha de nacimiento',
  dni: 'DNI',
  occupation: 'Profesión u oficio',
  phoneNumber: 'Número de celular',
  phoneCodeNumber: 'Código de país',
  address: 'Dirección de domicilio',
  maritalStatus: 'Estado civil',
  coupleName: 'Nombre del cónyuge / pareja',
  spiritualLevel: 'Nivel espiritual',
  isLeader: 'Liderazgo activo',
};

interface ChildFormRow {
  key: string;
  id?: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
}

@Component({
  selector: 'app-disciple-form',
  imports: [
    FormsModule, 
    PhoneInput, 
    DatePicker, 
    InvitedByPicker,
    Select,
  ],
  templateUrl: './disciple-form.html',
  styleUrl: './disciple-form.css',
})
export class DiscipleForm {
  disciplesService = inject(DisciplesService);
  private draftService = inject(DiscipleDraftService);
  private toastService = inject(ToastService);
  private formErrorMapper = inject(FormErrorMapperService);

  private draftSaveTimeoutId: ReturnType<typeof setTimeout> | null = null;

  id = input<number>();

  closed = output<void>();
  saved = output<DiscipleResponse>();

  isEditMode = computed(() => this.id() !== undefined);

  readonly todayIso = new Date().toISOString().split('T')[0];

  spiritualLevels = Object.values(SpiritualLevel);
  maritalStatuses = Object.values(MaritalStatus);

  spiritualLevelOptions: SelectOption<SpiritualLevel>[] = this.spiritualLevels.map((level) => ({
    label: SPIRITUAL_LEVEL_LABELS[level],
    value: level,
  }));

  maritalStatusOptions: SelectOption<MaritalStatus>[] = this.maritalStatuses.map((status) => ({
    label: MARITAL_STATUS_LABELS[status],
    value: status,
  }));

  isSaving = signal<boolean>(false);

  firstName = signal<string>('');
  lastName = signal<string>('');
  gender = signal<Gender>(Gender.MALE);
  birthDate = signal<string>('');
  dni = signal<string>('');
  occupation = signal<string>('');
  phoneCodeNumber = signal<string>('51');
  phoneNumber = signal<string>('');
  address = signal<string>('');
  maritalStatus = signal<MaritalStatus>(MaritalStatus.SINGLE);
  coupleName = signal<string>('');
  spiritualLevel = signal<SpiritualLevel>(SpiritualLevel.GUEST);
  isLeader = signal<boolean>(false);
  invitedByDiscipleId = signal<number | null>(null);
  invitedByLabel = signal<string>('');
  hasChildren = signal<boolean>(false);
  children = signal<ChildFormRow[]>([]);

  phoneIsValid = signal<boolean>(true);

  fieldErrors = signal<Record<string, string>>({});

  dniIsValid = computed(() => {
    const value = this.dni();
    return value.length === 0 || value.length === 8;
  });

  isLeaderToggleEnabled = computed(() => LEADER_ELIGIBLE_LEVELS.includes(this.spiritualLevel()));

  requiresCoupleName = computed(() =>
    this.maritalStatus() === MaritalStatus.MARRIED ||
    this.maritalStatus() === MaritalStatus.COHABITING
  );

  coupleNameLabel = computed(() =>
    this.maritalStatus() === MaritalStatus.COHABITING
      ? 'Nombre de la pareja'
      : 'Nombre del cónyuge'
  );

  dniHasLetters = signal<boolean>(false);
  private dniLetterWarningTimeoutId: ReturnType<typeof setTimeout> | null = null;

  genderOptions: SelectOption<Gender>[] = Object.values(Gender).map((g) => ({
    label: GENDER_LABELS[g],
    value: g,
  }));

  private previousSpiritualLevel: SpiritualLevel | null = null;

  constructor() {
    effect(() => {
      const currentLevel = this.spiritualLevel();
      const levelJustChanged = this.previousSpiritualLevel !== null && this.previousSpiritualLevel !== currentLevel;

      if (!this.isLeaderToggleEnabled()) {
        this.isLeader.set(false);
      } else if (levelJustChanged && currentLevel === SpiritualLevel.CELL_LEADER) {
        this.isLeader.set(true);
      }

      this.previousSpiritualLevel = currentLevel;
    });

    effect(() => {
      const currentId = this.id();
      if (currentId !== undefined) {
        this.disciplesService.selectDisciple(currentId);
      }
    });

    effect(() => {
      if (!this.isEditMode()) return;
      const d = this.disciplesService.disciple();
      if (!d) return;

      this.firstName.set(d.firstName);
      this.lastName.set(d.lastName);
      this.gender.set(d.gender);
      this.birthDate.set(d.birthDate);
      this.dni.set(d.dni);
      this.occupation.set(d.occupation ?? '');
      this.phoneCodeNumber.set(d.phoneCodeNumber);
      this.phoneNumber.set(d.phoneNumber ?? '');
      this.address.set(d.address ?? '');
      this.maritalStatus.set(d.maritalStatus);
      this.coupleName.set(d.coupleName ?? '');
      this.spiritualLevel.set(d.spiritualLevel);
      this.isLeader.set(d.isLeader);
      this.hasChildren.set(d.hasChildren);
      this.children.set(
        d.children.map((child) => ({
          key: crypto.randomUUID(),
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          gender: child.gender,
          birthDate: child.birthDate,
        }))
      );
    });

    if (!this.isEditMode()) {
      this.loadDraft();

      effect(() => {
        const snapshot = {
          firstName: this.firstName(),
          lastName: this.lastName(),
          gender: this.gender(),
          birthDate: this.birthDate(),
          dni: this.dni(),
          occupation: this.occupation(),
          phoneCodeNumber: this.phoneCodeNumber(),
          phoneNumber: this.phoneNumber(),
          address: this.address(),
          maritalStatus: this.maritalStatus(),
          coupleName: this.coupleName(),
          spiritualLevel: this.spiritualLevel(),
          isLeader: this.isLeader(),
          invitedByDiscipleId: this.invitedByDiscipleId(),
          invitedByLabel: this.invitedByLabel(),
          hasChildren: this.hasChildren(),
          children: this.children().map((row) => ({
            firstName: row.firstName,
            lastName: row.lastName,
            gender: row.gender,
            birthDate: row.birthDate,
          })),
        };
        this.scheduleDraftSave(snapshot);
      });
    }
  }

  fieldError(field: string): string {
    return this.fieldErrors()[field] ?? '';
  }

  clearFieldError(field: string): void {
    this.fieldErrors.update((errors) => {
      const copy = { ...errors };
      delete copy[field];
      return copy;
    });
  }

  addChild(): void {
    this.children.update((rows) => [
      ...rows,
      { key: crypto.randomUUID(), firstName: '', lastName: '', gender: Gender.MALE, birthDate: '' },
    ]);
  }

  removeChild(key: string): void {
    this.children.update((rows) => rows.filter((row) => row.key !== key));
  }

  updateChildField(key: string, field: 'firstName' | 'lastName' | 'gender' | 'birthDate', value: string | Gender | null): void {
    if (value === null) return;
    this.children.update((rows) =>
      rows.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
  }

  cancel(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    this.isSaving.set(true);
    this.fieldErrors.set({});

    if (this.isEditMode()) {
      this.submitUpdate();
    } else {
      this.submitRegister();
    }
  }

  private submitRegister(): void {
    const childrenPayload: DiscipleChildRegisterRequest[] = this.children().map((row) => ({
      firstName: row.firstName,
      lastName: row.lastName,
      gender: row.gender,
      birthDate: row.birthDate,
    }));

    const request: DiscipleRegisterRequest = {
      firstName: this.firstName(),
      lastName: this.lastName(),
      birthDate: this.birthDate(),
      gender: this.gender(),
      occupation: this.occupation(),
      phoneCodeNumber: this.phoneCodeNumber(),
      phoneNumber: this.phoneNumber(),
      address: this.address(),
      dni: this.dni(),
      maritalStatus: this.maritalStatus(),
      coupleName: this.requiresCoupleName() ? this.coupleName() : null,
      spiritualLevel: this.spiritualLevel(),
      isLeader: this.isLeader(),
      children: this.hasChildren() ? childrenPayload : [],
      invitedByDiscipleId: this.invitedByDiscipleId(),
    };

    this.disciplesService.register(request).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.draftService.clear();
        this.resetForm();
        this.toastService.show('Discípulo registrado exitosamente', 'success');
        this.saved.emit(response.data);
      },
      error: (httpError) => this.handleError(httpError),
    });
  }

  private submitUpdate(): void {
    const childrenPayload: DiscipleChildUpdateRequest[] = this.children().map((row) => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      gender: row.gender,
      birthDate: row.birthDate,
    }));

    const request: DiscipleUpdateRequest = {
      firstName: this.firstName(),
      lastName: this.lastName(),
      gender: this.gender(),
      birthDate: this.birthDate(),
      occupation: this.occupation(),
      phoneCodeNumber: this.phoneCodeNumber(),
      phoneNumber: this.phoneNumber(),
      address: this.address(),
      dni: this.dni(),
      maritalStatus: this.maritalStatus(),
      coupleName: this.requiresCoupleName() ? this.coupleName() : null,
      spiritualLevel: this.spiritualLevel(),
      isLeader: this.isLeader(),
      children: this.hasChildren() ? childrenPayload : [],
    };

    const currentId = this.id()!;

    this.disciplesService.update(currentId, request).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.toastService.show('Discípulo actualizado exitosamente', 'success');
        this.saved.emit(response.data);
      },
      error: (httpError) => this.handleError(httpError),
    });
  }

  private handleError(httpError: unknown): void {
    this.isSaving.set(false);
    this.toastService.show('No se pudo registrar el discípulo', 'error');
    this.fieldErrors.set(this.formErrorMapper.mapErrors(httpError, FIELD_ERROR_MAP));
  }

  childFieldError(index: number, field: string): string {
    return this.fieldErrors()[`child.${index}.${field}`] ?? '';
  }

  private resetForm(): void {
    this.firstName.set('');
    this.lastName.set('');
    this.birthDate.set('');
    this.dni.set('');
    this.occupation.set('');
    this.phoneCodeNumber.set('51');
    this.phoneNumber.set('');
    this.address.set('');
    this.maritalStatus.set(MaritalStatus.SINGLE);
    this.coupleName.set('');
    this.spiritualLevel.set(SpiritualLevel.GUEST);
    this.isLeader.set(false);
    this.invitedByDiscipleId.set(null);
    this.invitedByLabel.set('');
    this.hasChildren.set(false);
    this.children.set([]);
  }

  private loadDraft(): void {
    const draft = this.draftService.load();
    if (!draft) return;

    this.firstName.set(draft.firstName);
    this.lastName.set(draft.lastName);
    this.gender.set(draft.gender);
    this.birthDate.set(draft.birthDate);
    this.dni.set(draft.dni);
    this.occupation.set(draft.occupation);
    this.phoneCodeNumber.set(draft.phoneCodeNumber);
    this.phoneNumber.set(draft.phoneNumber);
    this.address.set(draft.address);
    this.maritalStatus.set(draft.maritalStatus);
    this.coupleName.set(draft.coupleName);
    this.spiritualLevel.set(draft.spiritualLevel);
    this.isLeader.set(draft.isLeader);
    this.invitedByDiscipleId.set(draft.invitedByDiscipleId);
    this.invitedByLabel.set(draft.invitedByLabel);
    this.hasChildren.set(draft.hasChildren);
    this.children.set(
      draft.children.map((child) => ({
        key: crypto.randomUUID(),
        firstName: child.firstName,
        lastName: child.lastName,
        gender: child.gender,
        birthDate: child.birthDate,
      }))
    );
  }

  private scheduleDraftSave(snapshot: Parameters<DiscipleDraftService['save']>[0]): void {
    if (this.draftSaveTimeoutId) clearTimeout(this.draftSaveTimeoutId);
    this.draftSaveTimeoutId = setTimeout(() => {
      this.draftService.save(snapshot);
    }, DRAFT_SAVE_DEBOUNCE_MS);
  }

  onDniInput(rawValue: string): void {
    const digitsOnly = rawValue.replace(/\D/g, '');
    this.dni.set(digitsOnly.slice(0, 8));

    if (digitsOnly.length !== rawValue.length) {
      this.dniHasLetters.set(true);
      if (this.dniLetterWarningTimeoutId) clearTimeout(this.dniLetterWarningTimeoutId);
      this.dniLetterWarningTimeoutId = setTimeout(() => this.dniHasLetters.set(false), 2000);
    }
  }
}