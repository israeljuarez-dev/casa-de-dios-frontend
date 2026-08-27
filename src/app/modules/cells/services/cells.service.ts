import { httpResource } from '@angular/common/http';
import { 
  Service,
  computed,
  inject,
  signal 
} from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '@core/config/api-endpoints.config';
import { ApiResponse } from '@core/types/api-response.types';
import { PaginationResponse } from '@core/types/pagination.types';
import { CellsApiService } from '@modules/cells/services/cells-api.service';
import { CellMemberSearchCriteria, CellSearchCriteria } from '@modules/cells/types/cell-request.types';
import { CellMemberResponse, CellResponse } from '@modules/cells/types/cell-response.types';
import { DiscipleResponse } from '@modules/disciples/types/disciple-response.types';

const DEFAULT_PAGE_SIZE = 10;

@Service()
export class CellsService {

  private readonly endpoints = inject(ApiEndpoints);
  private readonly cellsApiService = inject(CellsApiService);

  private readonly memberSearchCriteria = signal<CellMemberSearchCriteria>({});
  private readonly selectedId = signal<number | null>(null);
  private readonly cellSearchQuery = signal<string>('');
  private readonly addMemberSearchQuery = signal<string>('');
  private readonly leaderSearchQuery = signal<string>('');
  private readonly addMemberRefreshTrigger = signal<number>(0);
    private readonly searchCriteria = signal<CellSearchCriteria>({
    page: 1,
    size: DEFAULT_PAGE_SIZE,
    sortField: 'name',
    sortDirection: 'ASC',
    isPastorCell: false,
  });

  readonly currentMemberCriteria = computed(() => this.memberSearchCriteria());
  readonly pastorCells = computed(() => this.pastorCellsResource.value()?.data.content ?? []);
  readonly isLoadingPastorCells = computed(() => this.pastorCellsResource.isLoading());
  readonly cells = computed(() => this.cellsResource.value()?.data.content ?? []);
  readonly pagination = computed(() => this.cellsResource.value()?.data ?? null);
  readonly isLoading = computed(() => this.cellsResource.isLoading());
  readonly error = computed(() => this.cellsResource.error());
  readonly currentCriteria = computed(() => this.searchCriteria());
  readonly cell = computed(() => this.cellResource.value()?.data ?? null);
  readonly isLoadingCell = computed(() => this.cellResource.isLoading());
  readonly cellError = computed(() => this.cellResource.error());
  readonly members = computed(() => this.membersResource.value()?.data ?? []);
  readonly isLoadingMembers = computed(() => this.membersResource.isLoading());
  readonly leaderSearchResults = computed(() => this.leaderSearchResource.value()?.data.content ?? []);
  readonly isLoadingLeaderSearch = computed(() => this.leaderSearchResource.isLoading());
  readonly cellSearchResults = computed(() => this.cellSearchResource.value()?.data.content ?? []);
  readonly isLoadingCellSearch = computed(() => this.cellSearchResource.isLoading());
  readonly pastorMembersCell1 = computed(() => this.pastorMembersCell1Resource.value()?.data ?? []);
  readonly pastorMembersCell2 = computed(() => this.pastorMembersCell2Resource.value()?.data ?? []);
  readonly isLoadingPastorMembersCell1 = computed(() => this.pastorMembersCell1Resource.isLoading());
  readonly isLoadingPastorMembersCell2 = computed(() => this.pastorMembersCell2Resource.isLoading());
  readonly isLoadingAddMemberDisciples = computed(() => this.addMemberDisciplesResource.isLoading());
  readonly addMemberDisciples = computed(() => {
    const list = this.addMemberDisciplesResource.value()?.data.content ?? [];
    return [
      ...list.filter((d) => !d.isCellGroupMember),
      ...list.filter((d) => d.isCellGroupMember),
    ];
  });

  private readonly cellsResource = httpResource<ApiResponse<PaginationResponse<CellResponse>>>(() => ({
    url: this.endpoints.cellGroups.list,
    params: this.buildQueryParams(this.searchCriteria()),
  }));

  private readonly cellResource = httpResource<ApiResponse<CellResponse>>(() => {
    const id = this.selectedId();
    return id === null ? undefined : { url: this.endpoints.cellGroups.getById(id) };
  });

  private readonly membersResource = httpResource<ApiResponse<CellMemberResponse[]>>(() => {
    const id = this.selectedId();
    if (id === null) return undefined;
    const criteria = this.memberSearchCriteria();
    const params: Record<string, string> = {};
    if (criteria.search) params['search'] = criteria.search;
    if (criteria.spiritualLevel) params['spiritualLevel'] = criteria.spiritualLevel;
    if (criteria.gender) params['gender'] = criteria.gender;
    return { url: this.endpoints.cellGroups.members(id), params };
  });

  private readonly leaderSearchResource = httpResource<ApiResponse<PaginationResponse<{ 
    id: number; firstName: string; lastName: string; spiritualLevel: string 
  }>>>(() => {
    const query = this.leaderSearchQuery();
    if (query.length < 2) return undefined;
    return {
      url: this.endpoints.disciples.list,
      params: { search: query, spiritualLevel: 'LEADER', size: 8 },
    };
  });

  private readonly cellSearchResource = httpResource<ApiResponse<PaginationResponse<CellResponse>>>(() => {
    const query = this.cellSearchQuery();
    if (query.length < 2) return undefined;
    return {
      url: this.endpoints.cellGroups.list,
      params: { name: query, size: 8 },
    };
  });

  private readonly pastorCellsResource = httpResource<ApiResponse<PaginationResponse<CellResponse>>>(() => ({
    url: this.endpoints.cellGroups.list,
    params: { isPastorCell: true, size: 2 },
  }));

  private readonly addMemberDisciplesResource = httpResource<ApiResponse<PaginationResponse<DiscipleResponse>>>(() => {
    const refresh = this.addMemberRefreshTrigger();

    const query = this.addMemberSearchQuery();

    const params: Record<string, string | number | boolean> = {
      size: 50,
      sortField: 'lastName',
      sortDirection: 'ASC',
    };

    if (query) params['search'] = query;

    return { url: this.endpoints.disciples.list, params };
  });

  private readonly pastorMembersCell1Resource = httpResource<ApiResponse<CellMemberResponse[]>>(() => {
    const cells = this.pastorCells();
    return cells[0] ? { url: this.endpoints.cellGroups.members(cells[0].id) } : undefined;
  });

  private readonly pastorMembersCell2Resource = httpResource<ApiResponse<CellMemberResponse[]>>(() => {
    const cells = this.pastorCells();
    return cells[1] ? { url: this.endpoints.cellGroups.members(cells[1].id) } : undefined;
  });

  selectCell(id: number): void {
    this.selectedId.set(id);
    this.memberSearchCriteria.set({});
  }

  updateFilters(filters: Partial<CellSearchCriteria>): void {
    this.searchCriteria.update((current) => ({
      ...current,
      ...filters,
      page: 1,
      isPastorCell: false,
    }));
  }

  goToPage(page: number): void {
    this.searchCriteria.update((current) => ({ ...current, page }));
  }

  setLeaderSearchQuery(query: string): void {
    this.leaderSearchQuery.set(query);
  }

  setCellSearchQuery(query: string): void {
    this.cellSearchQuery.set(query);
  }

  refresh(): void {
    this.cellsResource.reload();
  }

  refreshMembers(): void {
    this.membersResource.reload();
  }

  refreshCell(): void {
    this.cellResource.reload();
  }

  register(request: Parameters<CellsApiService['register']>[0]): Observable<ApiResponse<CellResponse>> {
    return this.cellsApiService.register(request);
  }

  update(id: number, request: Parameters<CellsApiService['update']>[1]): Observable<ApiResponse<CellResponse>> {
    return this.cellsApiService.update(id, request);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.cellsApiService.delete(id);
  }

  exportExcel(): Observable<Blob> {
    const c = this.searchCriteria();
    return this.cellsApiService.exportExcel(c.name, c.leaderName, c.meetingDay);
  }

  addMember(cellId: number, discipleId: number): Observable<ApiResponse<CellMemberResponse>> {
    return this.cellsApiService.addMember(cellId, { discipleId });
  }

  removeMember(cellId: number, discipleId: number): Observable<ApiResponse<null>> {
    return this.cellsApiService.removeMember(cellId, discipleId);
  }

  moveMember(cellId: number, discipleId: number, targetCellId: number): Observable<ApiResponse<null>> {
    return this.cellsApiService.moveMember(cellId, discipleId, { targetCellId });
  }

  markCoreTwelve(cellId: number, discipleId: number): Observable<ApiResponse<CellMemberResponse>> {
    return this.cellsApiService.markCoreTwelve(cellId, discipleId);
  }

  unmarkCoreTwelve(cellId: number, discipleId: number): Observable<ApiResponse<null>> {
    return this.cellsApiService.unmarkCoreTwelve(cellId, discipleId);
  }

  markPastorCoreTwelve(cellId: number, discipleId: number): Observable<ApiResponse<CellMemberResponse>> {
    return this.cellsApiService.markPastorCoreTwelve(cellId, discipleId);
  }

  unmarkPastorCoreTwelve(cellId: number, discipleId: number): Observable<ApiResponse<null>> {
    return this.cellsApiService.unmarkPastorCoreTwelve(cellId, discipleId);
  }

  reloadPastorCells(): void {
    this.pastorCellsResource.reload();
  }

  reloadPastorMembers(): void {
    this.pastorMembersCell1Resource.reload();
    this.pastorMembersCell2Resource.reload();
  }

  updateMemberFilters(filters: Partial<CellMemberSearchCriteria>): void {
    this.memberSearchCriteria.update((current) => ({ ...current, ...filters }));
  }


  private buildQueryParams(criteria: CellSearchCriteria): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    if (criteria.name) params['name'] = criteria.name;
    if (criteria.leaderName) params['leaderName'] = criteria.leaderName;
    if (criteria.meetingDay) params['meetingDay'] = criteria.meetingDay;
    if (criteria.isPastorCell !== undefined) params['isPastorCell'] = criteria.isPastorCell;
    if (criteria.page !== undefined) params['page'] = criteria.page;
    if (criteria.size !== undefined) params['size'] = criteria.size;
    if (criteria.sortField) params['sortField'] = criteria.sortField;
    if (criteria.sortDirection) params['sortDirection'] = criteria.sortDirection;
    return params;
  }

  setAddMemberSearchQuery(query: string): void {
    this.addMemberSearchQuery.set(query);
  }

  reloadAddMemberDisciples(): void {
    this.addMemberRefreshTrigger.update((v) => v + 1);
  }
}