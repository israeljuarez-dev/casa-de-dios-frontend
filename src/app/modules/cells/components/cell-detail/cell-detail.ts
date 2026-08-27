import { 
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal 
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CellsService } from '@modules/cells/services/cells.service';
import { CellMemberResponse } from '@modules/cells/types/cell-response.types';
import { MeetingDayLabelPipe } from '@modules/cells/pipes/meeting-day-label.pipe';
import { AddMemberDrawer } from '@modules/cells/components/add-member-drawer/add-member-drawer';
import { MoveMemberDialog } from '@modules/cells/components/move-member-dialog/move-member-dialog';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { ToastService } from '@core/services/toast.service';
import { BackButton } from '@shared/components/back-button/back-button';
import { PrimaryButton } from '@shared/components/primary-button/primary-button';
import { Toggle } from '@shared/components/toggle/toggle';
import { Gender } from '@core/types/gender.types';
import { SpiritualLevel } from '@modules/disciples/enums/disciple.enums';
import { GENDER_LABELS } from '@modules/disciples/pipes/gender-label.pipe';
import { SPIRITUAL_LEVEL_LABELS } from '@modules/disciples/pipes/spiritual-level-label.pipe';
import { Select, SelectOption } from '@shared/components/select/select';
import { SpiritualLevelBadge } from '@shared/components/spiritual-level-badge/spiritual-level-badge';
import { WhatsappButton } from '@shared/components/whatsapp-button/whatsapp-button';
import { BirthdayStatusPipe } from '@modules/disciples/pipes/birthday-status.pipe';
import { SearchInput } from '@shared/components/search-input/search-input';

@Component({
  selector: 'app-cell-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MeetingDayLabelPipe,
    AddMemberDrawer,
    MoveMemberDialog,
    ConfirmDialog,
    BackButton,
    PrimaryButton,
    Toggle,
    SpiritualLevelBadge,
    WhatsappButton,
    BirthdayStatusPipe,
    Select,
    SearchInput,
  ],
  templateUrl: './cell-detail.html',
  styleUrl: './cell-detail.css',
})
export class CellDetail implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cellsService = inject(CellsService);
  private readonly toast = inject(ToastService);

  readonly showAddMemberDrawer = signal<boolean>(false);
  readonly memberToRemove = signal<CellMemberResponse | null>(null);
  readonly memberToMove = signal<CellMemberResponse | null>(null);
  readonly isRemoving = signal<boolean>(false);
  readonly cellId = signal<number>(0);
  readonly memberSearchFilter = signal<string>('');
  readonly memberSpiritualLevelFilter = signal<SpiritualLevel | ''>('');
  readonly memberGenderFilter = signal<Gender | ''>('');

  readonly cell = this.cellsService.cell;
  readonly members = this.cellsService.members;
  readonly isLoadingCell = this.cellsService.isLoadingCell;
  readonly isLoadingMembers = this.cellsService.isLoadingMembers;

  readonly spiritualLevelOptions: SelectOption<SpiritualLevel | ''>[] = [
    { label: 'Nivel espiritual', value: '' },
    ...Object.values(SpiritualLevel).map((l) => ({
      label: SPIRITUAL_LEVEL_LABELS[l],
      value: l,
    })),
  ];

  readonly genderOptions: SelectOption<Gender | ''>[] = [
    { label: 'Género', value: '' },
    { label: GENDER_LABELS[Gender.MALE], value: Gender.MALE },
    { label: GENDER_LABELS[Gender.FEMALE], value: Gender.FEMALE },
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cellId.set(id);
    this.cellsService.selectCell(id);
  }

  goBack(): void {
    const from = this.route.snapshot.queryParamMap.get('from');
    if (from === 'pastor') {
      this.router.navigate(['/cell-groups/pastor']);
    } else {
      this.router.navigate(['/cell-groups']);
    }
  }

  openAddMemberDrawer(): void {
    this.showAddMemberDrawer.set(true);
  }

  closeAddMemberDrawer(): void {
    this.showAddMemberDrawer.set(false);
  }

  onMemberAdded(): void {
    this.closeAddMemberDrawer();
    this.cellsService.refreshMembers();
    this.cellsService.refreshCell();
  }

  confirmRemoveMember(member: CellMemberResponse): void {
    this.memberToRemove.set(member);
  }

  cancelRemoveMember(): void {
    this.memberToRemove.set(null);
  }

  executeRemoveMember(): void {
    const member = this.memberToRemove();
    if (!member) return;

    this.isRemoving.set(true);
    this.cellsService.removeMember(this.cellId(), member.discipleId).subscribe({
      next: () => {
        this.toast.success('Miembro removido de la célula');
        this.memberToRemove.set(null);
        this.isRemoving.set(false);
        this.cellsService.refreshMembers();
        this.cellsService.refreshCell();
      },
      error: () => {
        this.toast.error('No se pudo remover al miembro');
        this.isRemoving.set(false);
      },
    });
  }

  openMoveDialog(member: CellMemberResponse): void {
    this.memberToMove.set(member);
  }

  closeMoveDialog(): void {
    this.memberToMove.set(null);
  }

  onMemberMoved(): void {
    this.closeMoveDialog();
    this.cellsService.refreshMembers();
    this.cellsService.refreshCell();
  }

  toggleCoreTwelve(member: CellMemberResponse): void {
    const cellId = this.cellId();
    const onError = () => this.toast.error('No se pudo actualizar el estado');

    if (member.isCoreTwelve) {
      this.cellsService.unmarkCoreTwelve(cellId, member.discipleId).subscribe({
        next: () => {
          this.toast.success('Removido de Los 12 del líder');
          this.cellsService.refreshMembers();
        },
        error: onError,
      });
    } else {
      this.cellsService.markCoreTwelve(cellId, member.discipleId).subscribe({
        next: () => {
          this.toast.success('Marcado como Los 12 del líder');
          this.cellsService.refreshMembers();
        },
        error: onError,
      });
    }
  }

  formatShortDate(isoDate: string): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const [, month, day] = isoDate.split('-');
    return `${Number(day)} de ${months[Number(month) - 1]}`;
  }

  onSearchChange(value: string): void {
    this.memberSearchFilter.set(value);
    this.cellsService.updateMemberFilters({ search: value || undefined });
  }

  onSpiritualLevelChange(value: SpiritualLevel | '' | null): void {
    const level = (value ?? '') as SpiritualLevel | '';
    this.memberSpiritualLevelFilter.set(level);
    this.cellsService.updateMemberFilters({
      spiritualLevel: level || undefined,
    });
  }

  onGenderChange(value: Gender | '' | null): void {
    const gender = (value ?? '') as Gender | '';
    this.memberGenderFilter.set(gender);
    this.cellsService.updateMemberFilters({
      gender: gender || undefined,
    });
  }
}