import { 
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed, 
  effect, 
  inject, 
  input,
  signal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DisciplesService } from '@modules/disciples/services/disciples.service';
import { MaritalStatusLabelPipe } from '@modules/disciples/pipes/marital-status-label.pipe';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
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
import { BackButton } from '@shared/components/back-button/back-button';
import { SpiritualLevelBadge } from '@shared/components/spiritual-level-badge/spiritual-level-badge';
import { DetailCard } from '@shared/components/detail-card/detail-card';
import { Toggle } from '@shared/components/toggle/toggle';

const LEADER_ELIGIBLE_LEVELS: SpiritualLevel[] = [
  SpiritualLevel.LEADER
];

const TEACHER_ELIGIBLE_LEVELS: SpiritualLevel[] = [
  SpiritualLevel.LEADER,
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
  isCellGroupLeader: 'Liderazgo activo',
  isTeacher: 'Profesor activo',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ 
    MaritalStatusLabelPipe,
    ConfirmDialog,
    BirthdayStatusPipe,
    Select,
    DatePicker,
    PhoneInput,
    FormsModule,
    SpiritualLevelBadge,
    BackButton,
    DetailCard,
    Toggle,
  ],
  templateUrl: './disciple-detail.html',
  styleUrl: './disciple-detail.css',
})
export class DiscipleDetail implements OnInit{

  private readonly disciplesService = inject(DisciplesService);
  private readonly disciplesApiService = inject(DisciplesApiService);
  private readonly toastService = inject(ToastService);
  private readonly formErrorMapper = inject(FormErrorMapperService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  id = input.required<string>();

  showDeleteConfirm = signal<boolean>(false);
  showEditForm = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  fieldErrors = signal<Record<string, string>>({});
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
  editIsCellGroupLeader = signal<boolean>(false);
  editIsTeacher = signal<boolean>(false);
  editChildren = signal<EditChildRow[]>([]);
  editPhoneIsValid = signal<boolean>(true);
  editDniHasLetters = signal<boolean>(false);
  editPhoneHasLetters = signal<boolean>(false);

  isCellGroupLeaderToggleEnabled = computed(() =>
    LEADER_ELIGIBLE_LEVELS.includes(this.editSpiritualLevel())
  );
  isTeacherToggleEnabled = computed(() =>
    TEACHER_ELIGIBLE_LEVELS.includes(this.editSpiritualLevel())
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
    if (!d || !d.birthDate) return '—';
    
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

    const [year, month, day] = d.birthDate!.split('-');

    return `${Number(day)} de ${months[Number(month) - 1]}, ${year} (${d.age} años)`;
  });
  genderDisplay = computed(() => {
    const d = this.disciple();
    if (!d) return '';
    return d.gender === 'MALE' ? '🧔 Masculino' : '👩 Femenino';
  });
  nextBirthdayLabel = computed(() => {
      const d = this.disciple();
      if (!d || !d.birthdayAlert) return 'Próximo cumpleaños';
      const nextBirthdayYear = new Date(d.birthdayAlert.nextBirthday).getFullYear();
      return `Próximo cumpleaños (${nextBirthdayYear})`;
  });
  editDniIsValid = computed(() => {
    const value = this.editDni();
    return value.length === 0 || value.length === 8;
  });

  disciple = this.disciplesService.disciple;
  isLoading = this.disciplesService.isLoadingDisciple;
  error = this.disciplesService.discipleError;

  private originalSnapshot: string = '';
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

  constructor() {
    effect(() => {
      const d = this.disciple();
      const editParam = this.route.snapshot.queryParamMap.get('edit');
      if (d && editParam === 'true' && !this.isEditing()) {
        this.enterEditMode();
      }
    });
  }

  ngOnInit(): void {
    this.disciplesService.selectDisciple(Number(this.id()));
  }
  
  enterEditMode(): void {
    const d = this.disciple();
    if (!d) return;

    this.editFirstName.set(d.firstName);
    this.editLastName.set(d.lastName);
    this.editGender.set(d.gender);
    this.editBirthDate.set(d.birthDate ?? '');
    this.editDni.set(d.dni ?? '');
    this.editOccupation.set(d.occupation ?? '');
    this.editPhoneCodeNumber.set(d.phoneCodeNumber ?? '51');
    this.editPhoneNumber.set(d.phoneNumber ?? '');
    this.editAddress.set(d.address ?? '');
    this.editMaritalStatus.set(d.maritalStatus);
    this.editCoupleName.set(d.coupleName ?? '');
    this.editSpiritualLevel.set(d.spiritualLevel);
    this.editIsCellGroupLeader.set(d.isCellGroupLeader);
    this.editIsTeacher.set(d.isTeacher);

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
    this.editDniHasLetters.set(false)
     this.editPhoneHasLetters.set(false);
    this.originalSnapshot = this.buildSnapshot();
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.toastService.show('No se modificó ningún dato', 'info');
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

  removeChild(key: string): void {
    this.editChildren.update((rows) => rows.filter((r) => r.key !== key));
  }

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

  childFieldError(index: number, field: string): string {
    return this.fieldErrors()[`child.${index}.${field}`] ?? '';
  }

  saveEdit(): void {
    if (!this.editDniIsValid()) {
      this.toastService.show('El DNI debe tener exactamente 8 dígitos o dejarse vacío', 'error');
      return;
    }

    if (this.editDniHasLetters()) {
      this.toastService.show('El DNI contiene caracteres inválidos', 'error');
      return;
    }

    if (this.editPhoneHasLetters()) {
      this.toastService.show('El número de celular contiene caracteres inválidos', 'error');
      return;
    }

    if (!this.editPhoneIsValid()) {
      this.toastService.show('El número de celular no es válido', 'error');
      return;
    }

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
      isCellGroupLeader: this.editIsCellGroupLeader(),
      isTeacher: this.editIsTeacher(), 
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
      isCellGroupLeader: this.editIsCellGroupLeader(),
      isTeacher: this.editIsTeacher(),
      children: this.editChildren().map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        gender: c.gender,
        birthDate: c.birthDate ?? '',
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
    if (!isoDate) return '—';
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

  onEditDniInput(rawValue: string): void {
    const digitsOnly = rawValue.replace(/\D/g, '');
    this.editDni.set(digitsOnly.slice(0, 8));

    this.editDniHasLetters.set(digitsOnly.length !== rawValue.length);
  }
}