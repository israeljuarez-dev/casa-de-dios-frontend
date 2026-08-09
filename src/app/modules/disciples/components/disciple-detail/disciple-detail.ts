import { 
  Component, 
  computed, 
  effect, 
  inject, 
  input,
  signal
} from '@angular/core';
import { 
  ActivatedRoute, 
  Router, 
  RouterLink 
} from '@angular/router';
import { DisciplesService } from '@modules/disciples/services/disciples.service';
import { SpiritualLevelLabelPipe } from '@modules/disciples/pipes/spiritual-level-label.pipe';
import { MaritalStatusLabelPipe } from '@modules/disciples/pipes/marital-status-label.pipe';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { DiscipleForm } from '@modules/disciples/components/disciple-form/disciple-form';
import { BirthdayStatusPipe } from '@modules/disciples/pipes/birthday-status.pipe';
import { ToastService } from '@core/services/toast.service';
import { Select, SelectOption } from '@shared/components/select/select';
import { DatePicker } from '@shared/components/date-picker/date-picker';
import { PhoneInput } from '@shared/components/phone-input/phone-input';
import { Gender } from '@core/types/gender.types';
import { MaritalStatus, SpiritualLevel } from '@modules/disciples/enums/disciple.enums';
import { GENDER_LABELS } from '@modules/disciples/pipes/gender-label.pipe';
import { MARITAL_STATUS_LABELS } from '@modules/disciples/pipes/marital-status-label.pipe';
import { SPIRITUAL_LEVEL_LABELS } from '@modules/disciples/pipes/spiritual-level-label.pipe';
import { DiscipleUpdateRequest } from '@modules/disciples/types/disciple-request.types';
import { FormErrorMapperService } from '@shared/services/form-error-mapper.service';
import { FormsModule } from '@angular/forms';
import { DisciplesApiService } from '@modules/disciples/services/disciples-api.service';

const LEADER_ELIGIBLE_LEVELS: SpiritualLevel[] = [
  SpiritualLevel.LEADER,
  SpiritualLevel.CELL_LEADER,
  SpiritualLevel.LEADERSHIP_SCHOOL_TEACHER,
];

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

interface EditChildRow {
  key: string;
  id: number | null;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
}

@Component({
  selector: 'app-disciple-detail',
  imports: [
    RouterLink, 
    SpiritualLevelLabelPipe, 
    MaritalStatusLabelPipe,
    ConfirmDialog,
    DiscipleForm,
    BirthdayStatusPipe,
    Select,
    DatePicker,
    PhoneInput,
    FormsModule,
  ],
  templateUrl: './disciple-detail.html',
  styleUrl: './disciple-detail.css',
})
export class DiscipleDetail {

  private disciplesService = inject(DisciplesService);
  private disciplesApiService = inject(DisciplesApiService);
  private toastService = inject(ToastService);
  private formErrorMapper = inject(FormErrorMapperService);

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  id = input.required<string>();

  disciple = this.disciplesService.disciple;

  isLoading = this.disciplesService.isLoadingDisciple;

  error = this.disciplesService.discipleError;

  showDeleteConfirm = signal<boolean>(false);

  showEditForm = signal<boolean>(false);


  isEditing = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  fieldErrors = signal<Record<string, string>>({});

  // Signals editables — se cargan al entrar en modo edición
  editFirstName = signal<string>('');
  editLastName = signal<string>('');
  editGender = signal<Gender>(Gender.MALE);
  editBirthDate = signal<string>('');
  editDni = signal<string>('');
  editOccupation = signal<string>('');
  editPhoneCodeNumber = signal<string>('51');
  editPhoneNumber = signal<string>('');
  editAddress = signal<string>('');
  editMaritalStatus = signal<MaritalStatus>(MaritalStatus.SINGLE);
  editCoupleName = signal<string>('');
  editSpiritualLevel = signal<SpiritualLevel>(SpiritualLevel.GUEST);
  editIsLeader = signal<boolean>(false);

  editChildren = signal<EditChildRow[]>([]);

  // Snapshot para detectar si hubo cambios
  private originalSnapshot = '';

  readonly todayIso = new Date().toISOString().split('T')[0];

  genderOptions: SelectOption<Gender>[] = Object.values(Gender).map((g) => ({
    label: GENDER_LABELS[g],
    value: g,
  }));

  maritalStatusOptions: SelectOption<MaritalStatus>[] = Object.values(MaritalStatus).map((s) => ({
    label: MARITAL_STATUS_LABELS[s],
    value: s,
  }));

  spiritualLevelOptions: SelectOption<SpiritualLevel>[] = Object.values(SpiritualLevel).map((l) => ({
    label: SPIRITUAL_LEVEL_LABELS[l],
    value: l,
  }));

  isLeaderToggleEnabled = computed(() =>
    LEADER_ELIGIBLE_LEVELS.includes(this.editSpiritualLevel())
  );

  requiresCoupleName = computed(() =>
    this.editMaritalStatus() === MaritalStatus.MARRIED ||
    this.editMaritalStatus() === MaritalStatus.COHABITING
  );

  coupleNameLabel = computed(() =>
    this.editMaritalStatus() === MaritalStatus.COHABITING
      ? 'Nombre de la pareja'
      : 'Nombre del cónyuge'
  );

  fullName = computed(() => {
    const d = this.disciple();
    return d ? `${d.firstName} ${d.lastName}` : '';
  });

  formattedBirthDate = computed(() => {
    const d = this.disciple();
    if (!d) return '';
    
    const months = [
      'enero', 
      'febrero', 
      'marzo', 
      'abril', 
      'mayo', 
      'junio',
      'julio', 
      'agosto', 
      'septiembre', 
      'octubre', 
      'noviembre', 
      'diciembre',
    ];

    const [year, month, day] = d.birthDate.split('-');

    return `${Number(day)} de ${months[Number(month) - 1]}, ${year} (${d.age} años)`;
  });

  genderDisplay = computed(() => {
    const d = this.disciple();
    if (!d) return '';
    return d.gender === 'MALE' ? '🧔 Masculino' : '👩 Femenino';
  });

  nextBirthdayLabel = computed(() => {
    const d = this.disciple();
    if (!d) return '';
    const nextBirthdayYear = new Date(d.birthdayAlert.nextBirthday).getFullYear();
    return `Próximo cumpleaños (${nextBirthdayYear})`;
  });

  constructor() {
    effect(() => {
      this.disciplesService.selectDisciple(Number(this.id()));
    });

    effect(() => {
      const d = this.disciple();
      const editParam = this.route.snapshot.queryParamMap.get('edit');
      if (d && editParam === 'true' && !this.isEditing()) {
        this.enterEditMode();
      }
    });
  }

  enterEditMode(): void {
    const d = this.disciple();
    if (!d) return;

    this.editFirstName.set(d.firstName);
    this.editLastName.set(d.lastName);
    this.editGender.set(d.gender);
    this.editBirthDate.set(d.birthDate);
    this.editDni.set(d.dni ?? '');
    this.editOccupation.set(d.occupation ?? '');
    this.editPhoneCodeNumber.set(d.phoneCodeNumber ?? '51');
    this.editPhoneNumber.set(d.phoneNumber ?? '');
    this.editAddress.set(d.address ?? '');
    this.editMaritalStatus.set(d.maritalStatus);
    this.editCoupleName.set(d.coupleName ?? '');
    this.editSpiritualLevel.set(d.spiritualLevel);
    this.editIsLeader.set(d.isLeader);

    this.editChildren.set(
      d.children.map((child) => ({
        key: crypto.randomUUID(),
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        gender: child.gender,
        birthDate: child.birthDate,
      }))
    );

    this.fieldErrors.set({});
    this.originalSnapshot = this.buildSnapshot();
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.fieldErrors.set({});
  }

  cancelEditAndGoBack(): void {
    this.toastService.show('No se modificó ningún dato', 'info');
    this.isEditing.set(false);
    this.router.navigate(['/disciples']);
  }

  addChild(): void {
    this.editChildren.update((rows) => [
      ...rows,
      {
        key: crypto.randomUUID(),
        id: null,
        firstName: '',
        lastName: '',
        gender: Gender.MALE,
        birthDate: '',
      },
    ]);
  }

  // AÑADIDO: elimina un hijo del array por su key
  // si tenía id → el backend lo eliminará al no estar en la lista
  removeChild(key: string): void {
    this.editChildren.update((rows) => rows.filter((r) => r.key !== key));
  }

  // AÑADIDO: actualiza un campo de un hijo específico por su key
  // MODIFICADO: acepta null para ignorar emisiones vacías del select
  updateChildField(
    key: string,
    field: 'firstName' | 'lastName' | 'gender' | 'birthDate',
    value: string | Gender | null
  ): void {
    if (value === null) return;
    this.editChildren.update((rows) =>
      rows.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
  }

  // AÑADIDO: error de un campo de un hijo por índice
  childFieldError(index: number, field: string): string {
    return this.fieldErrors()[`child.${index}.${field}`] ?? '';
  }

  saveEdit(): void {
    const currentSnapshot = this.buildSnapshot();

    if (currentSnapshot === this.originalSnapshot) {
      this.toastService.show('No se modificó ningún dato', 'info');
      this.isEditing.set(false);
      return;
    }

    const d = this.disciple();
    if (!d) return;

    this.isSaving.set(true);
    this.fieldErrors.set({});

    const request: DiscipleUpdateRequest = {
      firstName: this.editFirstName(),
      lastName: this.editLastName(),
      gender: this.editGender(),
      birthDate: this.editBirthDate(),
      occupation: this.editOccupation(),
      phoneCodeNumber: this.editPhoneNumber().trim() ? this.editPhoneCodeNumber() : null,
      phoneNumber: this.editPhoneNumber().trim() || null,
      address: this.editAddress().trim() || null,
      dni: this.editDni().trim() || null,
      maritalStatus: this.editMaritalStatus(),
      coupleName: this.requiresCoupleName() ? this.editCoupleName() : null,
      spiritualLevel: this.editSpiritualLevel(),
      isLeader: this.editIsLeader(),
      children: this.editChildren().map((child) => ({
        id: child.id ?? undefined,
        firstName: child.firstName,
        lastName: child.lastName,
        gender: child.gender,
        birthDate: child.birthDate,
      })),
    };

    this.disciplesApiService.update(d.id, request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.toastService.show('Modificación de datos exitosa', 'success');
        this.disciplesService.reloadDisciple();
        this.disciplesService.selectDisciple(Number(this.id()));
      },
      error: (httpError) => {
        this.isSaving.set(false);
        this.toastService.show('No se pudieron guardar los cambios', 'error');
        this.fieldErrors.set(this.formErrorMapper.mapErrors(httpError, FIELD_ERROR_MAP));
      },
    });
  }

  private buildSnapshot(): string {
    return JSON.stringify({
      firstName: this.editFirstName(),
      lastName: this.editLastName(),
      gender: this.editGender(),
      birthDate: this.editBirthDate(),
      dni: this.editDni(),
      occupation: this.editOccupation(),
      phoneCodeNumber: this.editPhoneCodeNumber(),
      phoneNumber: this.editPhoneNumber(),
      address: this.editAddress(),
      maritalStatus: this.editMaritalStatus(),
      coupleName: this.editCoupleName(),
      spiritualLevel: this.editSpiritualLevel(),
      isLeader: this.editIsLeader(),
      children: this.editChildren().map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        gender: c.gender,
        birthDate: c.birthDate,
      })),
    });
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

  whatsappLink(): string {
    const d = this.disciple();
    return d ? `https://wa.me/${d.phoneCodeNumber}${d.phoneNumber}` : '';
  }

  formatChildBirthDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }

  confirmDelete(): void {
    const d = this.disciple();
    if (!d) return;

    this.disciplesService.delete(d.id).subscribe({
      next: () => {
        this.disciplesService.refresh();
        this.router.navigate(['/disciples']);
      },
      error: () => {
        this.showDeleteConfirm.set(false);
      },
    });
  }

  onDiscipleUpdated(): void {
    this.showEditForm.set(false);
    this.disciplesService.selectDisciple(Number(this.id()));
  }
}