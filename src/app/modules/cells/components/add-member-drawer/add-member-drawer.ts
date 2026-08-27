import { 
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal 
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CellsService } from '@modules/cells/services/cells.service';
import { DisciplesService } from '@modules/disciples/services/disciples.service';
import { ToastService } from '@core/services/toast.service';
import { DiscipleResponse } from '@modules/disciples/types/disciple-response.types';
import { SpiritualLevelBadge } from '@shared/components/spiritual-level-badge/spiritual-level-badge';
import { SearchInput } from '@shared/components/search-input/search-input';
import { Toggle } from '@shared/components/toggle/toggle';
import { DiscipleForm } from '@modules/disciples/components/disciple-form/disciple-form';

interface AddedMember {
  discipleId: number;
  firstName: string;
  lastName: string;
  memberId: number | null;
  isCoreTwelve: boolean;
}

@Component({
  selector: 'app-add-member-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    SpiritualLevelBadge,
    SearchInput,
    Toggle,
    DiscipleForm,
  ],
  templateUrl: './add-member-drawer.html',
  styleUrl: './add-member-drawer.css',
})
export class AddMemberDrawer implements OnInit{

  private readonly cellsService = inject(CellsService);
  private readonly disciplesService = inject(DisciplesService);
  private readonly toast = inject(ToastService);

  readonly cellId = input.required<number>();
  readonly cellName = input<string>('');
  readonly currentMemberIds = input<number[]>([]);

  readonly closed = output<void>();
  readonly membersAdded = output<void>();

  readonly searchQuery = signal<string>('');
  readonly isAdding = signal<boolean>(false);
  readonly addedMembers = signal<AddedMember[]>([]);
  readonly showRegisterForm = signal<boolean>(false);

  readonly addedIds = computed(() => new Set(this.addedMembers().map((m) => m.discipleId)));

  readonly disciples = this.cellsService.addMemberDisciples;
  readonly isLoading = this.cellsService.isLoadingAddMemberDisciples;
  readonly searchResults = this.disciplesService.inviterSearchResults;
  readonly isLoadingSearch = this.disciplesService.inviterSearchLoading;

  ngOnInit(): void {
    this.addedMembers.set([]);
    this.searchQuery.set('');
    this.cellsService.setAddMemberSearchQuery('');
    this.cellsService.reloadAddMemberDisciples();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.cellsService.setAddMemberSearchQuery(query);
  }

  isAlreadyAdded(discipleId: number): boolean {
    return this.addedIds().has(discipleId);
  }

  onSearchInput(query: string): void {
    this.searchQuery.set(query);
    this.disciplesService.setInviterSearchQuery(query);
  }

  addMember(disciple: DiscipleResponse): void {
    if (disciple.isCellGroupMember || this.isAlreadyAdded(disciple.id)) return;

    this.isAdding.set(true);
    this.cellsService.addMember(this.cellId(), disciple.id).subscribe({
      next: (res) => {
        this.addedMembers.update((list) => [
          ...list,
          {
            discipleId: disciple.id,
            firstName: disciple.firstName,
            lastName: disciple.lastName,
            memberId: res.data?.memberId ?? null,
            isCoreTwelve: false,
          },
        ]);
        this.isAdding.set(false);
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'No se pudo añadir al miembro');
        this.isAdding.set(false);
      },
    });
  }

  toggleCoreTwelve(added: AddedMember): void {
    const cellId = this.cellId();
    if (added.isCoreTwelve) {
      this.cellsService.unmarkCoreTwelve(cellId, added.discipleId).subscribe({
        next: () => {
          this.updateAddedMember(added.discipleId, { isCoreTwelve: false });
        },
        error: () => this.toast.error('No se pudo actualizar el estado'),
      });
    } else {
      this.cellsService.markCoreTwelve(cellId, added.discipleId).subscribe({
        next: () => {
          this.updateAddedMember(added.discipleId, { isCoreTwelve: true });
        },
        error: () => this.toast.error('No se pudo actualizar el estado'),
      });
    }
  }

  removeMember(added: AddedMember): void {
    this.cellsService.removeMember(this.cellId(), added.discipleId).subscribe({
      next: () => {
        this.addedMembers.update((list) =>
          list.filter((m) => m.discipleId !== added.discipleId)
        );
        setTimeout(() => {
          this.cellsService.reloadAddMemberDisciples();
        }, 300);
      },
      error: () => this.toast.error('No se pudo remover al miembro'),
    });
  }

  onDiscipleSaved(disciple: DiscipleResponse): void {
    this.showRegisterForm.set(false);
    this.isAdding.set(true);
    this.cellsService.addMember(this.cellId(), disciple.id).subscribe({
      next: (res) => {
        this.addedMembers.update((list) => [
          ...list,
          {
            discipleId: disciple.id,
            firstName: disciple.firstName,
            lastName: disciple.lastName,
            memberId: res.data?.memberId ?? null,
            isCoreTwelve: false,
          },
        ]);
        this.isAdding.set(false);
        this.toast.success('Discípulo registrado y añadido en la lista para ser miembro de la célula');
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'No se pudo añadir al miembro');
        this.isAdding.set(false);
      },
    });
  }

  confirm(): void {
    if (this.addedMembers().length > 0) {
      this.membersAdded.emit();
    }
    this.closed.emit();
  }

  close(): void {
    this.closed.emit();
  }

  private updateAddedMember(discipleId: number, changes: Partial<AddedMember>): void {
    this.addedMembers.update((list) =>
      list.map((m) => m.discipleId === discipleId ? { ...m, ...changes } : m)
    );
  }
}