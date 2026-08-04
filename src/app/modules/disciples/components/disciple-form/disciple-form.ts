import { 
  Component, 
  computed, 
  effect, 
  inject, 
  input, 
  signal 
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DisciplesService } from '@modules/disciples/services/disciples.service';
import { MaritalStatus, SpiritualLevel } from '@modules/disciples/enums/disciple.enums';
import { SpiritualLevelLabelPipe } from '@modules/disciples/pipes/spiritual-level-label.pipe';
import { MaritalStatusLabelPipe } from '@modules/disciples/pipes/marital-status-label.pipe';
import { PhoneInput } from '@shared/components/phone-input/phone-input';
import { ApiErrorResponse } from '@core/types/api-response.types';
import {
  DiscipleChildRegisterRequest,
  DiscipleChildUpdateRequest,
  DiscipleRegisterRequest,
  DiscipleUpdateRequest,
} from '@modules/disciples/types/disciple-request.types';

const LEADER_ELIGIBLE_LEVELS: SpiritualLevel[] = [
  SpiritualLevel.LEADER,
  SpiritualLevel.CELL_LEADER,
  SpiritualLevel.LEADERSHIP_SCHOOL_TEACHER,
];

interface ChildFormRow {
  key: string;
  id?: number;
  firstName: string;
  lastName: string;
  birthDate: string;
}

@Component({
  selector: 'app-disciple-form',
  imports: [FormsModule, SpiritualLevelLabelPipe, MaritalStatusLabelPipe, PhoneInput],
  templateUrl: './disciple-form.html',
  styleUrl: './disciple-form.css',
})
export class DiscipleForm {

  private disciplesService = inject(DisciplesService);

  private router = inject(Router);

  // Presente solo en la ruta de edición (/disciples/:id/edit); ausente en /disciples/new
  id = input<string>();

  isEditMode = computed(() => !!this.id());

  spiritualLevels = Object.values(SpiritualLevel);

  maritalStatuses = Object.values(MaritalStatus);

  isSaving = signal<boolean>(false);

  saveError = signal<ApiErrorResponse | null>(null);
 
  firstName = signal<string>('');
 
  lastName = signal<string>('');

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

  invitedByDiscipleId = signal<string>('');

  hasChildren = signal<boolean>(false);

  children = signal<ChildFormRow[]>([]);

  isLeaderToggleEnabled = computed(() => LEADER_ELIGIBLE_LEVELS.includes(this.spiritualLevel()));
  
  requiresCoupleName = computed(() => this.maritalStatus() === MaritalStatus.MARRIED);

  constructor() {
    // Si cambia el nivel espiritual a uno que no califica para líder, apaga el switch automáticamente
    effect(() => {
      if (!this.isLeaderToggleEnabled() && this.isLeader()) {
        this.isLeader.set(false);
      }
    });

    // Modo edición: en cuanto sabemos el id, le pedimos al servicio que cargue ese discípulo
    effect(() => {
      const currentId = this.id();
      if (currentId) {
        this.disciplesService.selectDisciple(Number(currentId));
      }
    });

    // Cuando el discípulo cargado por el servicio cambie, rellenamos el formulario con sus datos
    effect(() => {
      if (!this.isEditMode()) return;
      const d = this.disciplesService.disciple();
      if (!d) return;

      this.firstName.set(d.firstName);
      this.lastName.set(d.lastName);
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
          birthDate: child.birthDate,
        }))
      );
    });
  }

  addChild(): void {
    this.children.update((rows) => [
      ...rows,
      { key: crypto.randomUUID(), firstName: '', lastName: '', birthDate: '' },
    ]);
  }

  removeChild(key: string): void {
    this.children.update((rows) => rows.filter((row) => row.key !== key));
  }

  updateChildField(key: string, field: 'firstName' | 'lastName' | 'birthDate', value: string): void {
    this.children.update((rows) =>
      rows.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
  }

  cancel(): void {
    this.router.navigate(this.isEditMode() ? ['/disciples', this.id()] : ['/disciples']);
  }

  onSubmit(): void {
    this.isSaving.set(true);
    this.saveError.set(null);

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
      birthDate: row.birthDate,
    }));

    const request: DiscipleRegisterRequest = {
      firstName: this.firstName(),
      lastName: this.lastName(),
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
      invitedByDiscipleId: this.invitedByDiscipleId() ? Number(this.invitedByDiscipleId()) : null,
    };

    this.disciplesService.register(request).subscribe({
      next: (response) => {
        this.disciplesService.refresh();
        this.isSaving.set(false);
        this.router.navigate(['/disciples', response.data.id]);
      },
      error: (httpError) => this.handleError(httpError),
    });
  }

  private submitUpdate(): void {
    const childrenPayload: DiscipleChildUpdateRequest[] = this.children().map((row) => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      birthDate: row.birthDate,
    }));

    const request: DiscipleUpdateRequest = {
      firstName: this.firstName(),
      lastName: this.lastName(),
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

    const numericId = Number(this.id());

    this.disciplesService.update(numericId, request).subscribe({
      next: () => {
        this.disciplesService.refresh();
        this.isSaving.set(false);
        this.router.navigate(['/disciples', numericId]);
      },
      error: (httpError) => this.handleError(httpError),
    });
  }

  private handleError(httpError: unknown): void {
    const apiError = (httpError as { error: ApiErrorResponse }).error;
    this.saveError.set(apiError);
    this.isSaving.set(false);
  }
}