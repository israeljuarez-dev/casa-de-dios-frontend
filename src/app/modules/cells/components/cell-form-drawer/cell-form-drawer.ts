import { 
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal 
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CellsService } from '@modules/cells/services/cells.service';
import { ToastService } from '@core/services/toast.service';
import { CellResponse } from '@modules/cells/types/cell-response.types';
import { CellRegisterRequest, CellUpdateRequest } from '@modules/cells/types/cell-request.types';
import { MeetingDay } from '@modules/cells/enums/cell.enums';
import { MEETING_DAY_LABELS } from '@modules/cells/pipes/meeting-day-label.pipe';
import { Gender } from '@core/types/gender.types';
import { TimePicker } from '@shared/components/time-picker/time-picker';
import { Select, SelectOption } from '@shared/components/select/select';
import { Toggle } from '@shared/components/toggle/toggle';

interface LeaderOption {
  id: number;
  firstName: string;
  lastName: string;
  spiritualLevel: string;
}

@Component({
  selector: 'app-cell-form-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    Select,
    TimePicker,
    Toggle,
  ],
  templateUrl: './cell-form-drawer.html',
  styleUrl: './cell-form-drawer.css',
})
export class CellFormDrawer implements OnInit {

  private readonly cellsService = inject(CellsService);
  private readonly toast = inject(ToastService);

  readonly cellToEdit = input<CellResponse | null>(null);

  readonly closed = output<void>();
  readonly saved = output<void>();

  readonly name = signal<string>('');
  readonly meetingDay = signal<MeetingDay | ''>(MeetingDay.MONDAY);
  readonly meetingTime = signal<string>('00:00');
  readonly location = signal<string>('');
  readonly isPastorCell = signal<boolean>(false);
  readonly pastorCellGender = signal<Gender | ''>('');
  readonly leaderSearchQuery = signal<string>('');
  readonly selectedLeader = signal<LeaderOption | null>(null);
  readonly showLeaderResults = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);

  readonly isEditing = computed(() => this.cellToEdit() !== null);

  readonly leaderSearchResults = this.cellsService.leaderSearchResults;
  readonly isLoadingLeaderSearch = this.cellsService.isLoadingLeaderSearch;
  readonly Gender = Gender;
  readonly meetingDays = Object.values(MeetingDay);
  readonly MeetingDay = MeetingDay;

  readonly meetingDayOptions: SelectOption<MeetingDay | ''>[] = [
    { label: 'Sin definir', value: '' },
    ...Object.values(MeetingDay).map((day) => ({
      label: MEETING_DAY_LABELS[day],
      value: day,
    })),
  ];
  
  ngOnInit(): void {
    const cell = this.cellToEdit();
    if (cell) {
      this.name.set(cell.name);
      this.meetingDay.set(cell.meetingDay ?? '');
      this.meetingTime.set(cell.meetingTime ?? '');
      this.location.set(cell.location ?? '');
      this.isPastorCell.set(cell.isPastorCell);
      if (cell.leader) {
        this.selectedLeader.set({
          id: cell.leader.id,
          firstName: cell.leader.firstName,
          lastName: cell.leader.lastName,
          spiritualLevel: 'LEADER',
        });
        this.leaderSearchQuery.set(
          `${cell.leader.firstName} ${cell.leader.lastName}`
        );
      }
    }
  }

  onLeaderSearchInput(query: string): void {
    this.leaderSearchQuery.set(query);
    this.cellsService.setLeaderSearchQuery(query);
    this.showLeaderResults.set(query.length >= 2);
    if (!query) this.selectedLeader.set(null);
  }

  selectLeader(leader: LeaderOption): void {
    this.selectedLeader.set(leader);
    this.leaderSearchQuery.set(`${leader.firstName} ${leader.lastName}`);
    this.showLeaderResults.set(false);
  }

  clearLeader(): void {
    this.selectedLeader.set(null);
    this.leaderSearchQuery.set('');
    this.cellsService.setLeaderSearchQuery('');
    this.showLeaderResults.set(false);
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  close(): void {
    this.closed.emit();
  }

  save(): void {
    if (!this.name().trim()) {
      this.toast.error('El nombre de la célula es obligatorio');
      return;
    }

    if (!this.isPastorCell() && !this.selectedLeader()) {
      this.toast.error('Debes seleccionar un líder para la célula');
      return;
    }

    if (this.isPastorCell() && !this.pastorCellGender()) {
      this.toast.error('Debes indicar el género para la célula principal');
      return;
    }

    this.isSaving.set(true);

    const cell = this.cellToEdit();

    if (cell) {
      const request: CellUpdateRequest = {
        name: this.name().trim(),
        leaderDiscipleId: this.selectedLeader()?.id ?? null,
        meetingDay: (this.meetingDay() as MeetingDay) || null,
        meetingTime: this.meetingTime() || null,
        location: this.location().trim() || null,
      };

      this.cellsService.update(cell.id, request).subscribe({
        next: () => {
          this.toast.success('Célula actualizada exitosamente');
          this.isSaving.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'No se pudo actualizar la célula');
          this.isSaving.set(false);
        },
      });
    } else {
      const request: CellRegisterRequest = {
        name: this.name().trim(),
        leaderDiscipleId: this.isPastorCell() ? null : (this.selectedLeader()?.id ?? null),
        meetingDay: (this.meetingDay() as MeetingDay) || null,
        meetingTime: this.meetingTime() || null,
        location: this.location().trim() || null,
        isPastorCell: this.isPastorCell(),
        pastorCellGender: this.isPastorCell() ? (this.pastorCellGender() as Gender) : null,
      };

      this.cellsService.register(request).subscribe({
        next: () => {
          this.toast.success('Célula registrada exitosamente');
          this.isSaving.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'No se pudo registrar la célula');
          this.isSaving.set(false);
        },
      });
    }
  }

  onMeetingDayChange(value: MeetingDay | '' | null): void {
    this.meetingDay.set((value ?? '') as MeetingDay | '');
  }
}