import { httpResource } from '@angular/common/http';
import { 
    Service, 
    computed, 
    effect, 
    inject, 
    signal 
} from '@angular/core';
import { ApiEndpoints } from '@core/config/api-endpoints.config';
import { ApiResponse } from '@core/types/api-response.types';
import { PaginationResponse } from '@core/types/pagination.types';
import { DisciplesApiService } from '@modules/disciples/services/disciples-api.service';
import { DiscipleSearchCriteria } from '@modules/disciples/types/disciple-request.types';
import { DiscipleResponse } from '@modules/disciples/types/disciple-response.types';
import { Observable } from 'rxjs';

const DEFAULT_PAGE_SIZE = 10;

@Service()
export class DisciplesService {

  private readonly endpoints = inject(ApiEndpoints);

  private readonly disciplesApiService = inject(DisciplesApiService);

  private searchCriteria = signal<DiscipleSearchCriteria>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sortField: 'lastName',
    sortDirection: 'ASC',
  });

  private selectedId = signal<number | null>(null);

  private cachedPagination = signal<PaginationResponse<DiscipleResponse> | null>(null);

  private inviterSearchQuery = signal<string>('');

  disciples = computed(() => this.disciplesResource.value()?.data.content ?? []);
  pagination = computed(() => this.disciplesResource.value()?.data ?? null);

  isLoading = computed(() => this.disciplesResource.isLoading());
  error = computed(() => this.disciplesResource.error());
  currentCriteria = computed(() => this.searchCriteria());

  disciple = computed(() => this.discipleResource.value()?.data ?? null);
  isLoadingDisciple = computed(() => this.discipleResource.isLoading());
  discipleError = computed(() => this.discipleResource.error());

  inviterSearchResults = computed(() => this.inviterSearchResource.value()?.data.content ?? []);
  inviterSearchLoading = computed(() => this.inviterSearchResource.isLoading());
  
  totalDisciplesCount = computed(() =>
    this.totalCountResource.value()?.data.totalElements ?? null
  );
  
  private disciplesResource = httpResource<ApiResponse<PaginationResponse<DiscipleResponse>>>(() => ({
    url: this.endpoints.disciples.list,
    params: this.buildQueryParams(this.searchCriteria()),
  }));

  private discipleResource = httpResource<ApiResponse<DiscipleResponse>>(() => {
    const id = this.selectedId();
    return id === null ? undefined : { url: this.endpoints.disciples.getById(id) };
  });

  private inviterSearchResource = httpResource<ApiResponse<PaginationResponse<DiscipleResponse>>>(() => {
    const query = this.inviterSearchQuery();
    if (query.length < 2) return undefined;
    return {
      url: this.endpoints.disciples.list,
      params: { firstName: query, size: 8 },
    };
  });

  private totalCountResource = httpResource<ApiResponse<PaginationResponse<DiscipleResponse>>>(() => ({
    url: this.endpoints.disciples.list,
    params: { page: 0, size: 1 },
  }));

  constructor() {
    effect(() => {
      const value = this.disciplesResource.value();
      if (value) {
        this.cachedPagination.set(value.data);
      }
    });
  }

  selectDisciple(id: number): void {
    this.selectedId.set(id);
  }

  updateFilters(filters: Partial<DiscipleSearchCriteria>): void {
    this.searchCriteria.update((current) => ({
      ...current,
      ...filters,
      page: 0,
    }));
  }

  goToPage(page: number): void {
    this.searchCriteria.update((current) => ({ ...current, page }));
  }

  register(request: Parameters<DisciplesApiService['register']>[0]) {
    return this.disciplesApiService.register(request);
  }

  update(id: number, request: Parameters<DisciplesApiService['update']>[1]) {
    return this.disciplesApiService.update(id, request);
  }

  delete(id: number) {
    return this.disciplesApiService.delete(id);
  }

  refresh(): void {
    this.disciplesResource.reload();
  }

  private buildQueryParams(criteria: DiscipleSearchCriteria): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};

    if (criteria.search) {
      params['search'] = criteria.search;
    } else {
      if (criteria.firstName) params['firstName'] = criteria.firstName;
      if (criteria.lastName) params['lastName'] = criteria.lastName;
    }
    
    if (criteria.gender) params['gender'] = criteria.gender;
    if (criteria.spiritualLevel) params['spiritualLevel'] = criteria.spiritualLevel;
    if (criteria.maritalStatus) params['maritalStatus'] = criteria.maritalStatus;
    if (criteria.page !== undefined) params['page'] = criteria.page;
    if (criteria.size !== undefined) params['size'] = criteria.size;
    if (criteria.sortField) params['sortField'] = criteria.sortField;
    if (criteria.sortDirection) params['sortDirection'] = criteria.sortDirection;

    return params;
  }

  exportExcel(): Observable<Blob> {
    return this.disciplesApiService.exportExcel(this.searchCriteria());
  }

  setInviterSearchQuery(query: string): void {
    this.inviterSearchQuery.set(query);
  }

  reloadDisciple(): void {
    this.discipleResource.reload();
  }
}