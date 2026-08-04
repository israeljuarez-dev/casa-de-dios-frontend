import { httpResource } from '@angular/common/http';
import { 
    Service, 
    computed, 
    inject, 
    signal 
} from '@angular/core';
import { ApiEndpoints } from '@core/config/api-endpoints.config';
import { ApiResponse } from '@core/types/api-response.types';
import { PaginationResponse } from '@core/types/pagination.types';
import { DisciplesApiService } from '@modules/disciples/services/disciples-api.service';
import { DiscipleSearchCriteria } from '@modules/disciples/types/disciple-request.types';
import { DiscipleResponse } from '@modules/disciples/types/disciple-response.types';

const DEFAULT_PAGE_SIZE = 10;

@Service()
export class DisciplesService {

  private endpoints = inject(ApiEndpoints);

  private disciplesApiService = inject(DisciplesApiService);

  private searchCriteria = signal<DiscipleSearchCriteria>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sortField: 'lastName',
    sortDirection: 'ASC',
  });

  private disciplesResource = httpResource<ApiResponse<PaginationResponse<DiscipleResponse>>>(() => ({
    url: this.endpoints.disciples.list,
    params: this.buildQueryParams(this.searchCriteria()),
  }));

  disciples = computed(() => this.disciplesResource.value()?.data.content ?? []);

  pagination = computed(() => this.disciplesResource.value()?.data ?? null);

  isLoading = computed(() => this.disciplesResource.isLoading());

  error = computed(() => this.disciplesResource.error());
  
  currentCriteria = computed(() => this.searchCriteria());

  private selectedId = signal<number | null>(null);

  private discipleResource = httpResource<ApiResponse<DiscipleResponse>>(() => {
    const id = this.selectedId();
    return id === null ? undefined : { url: this.endpoints.disciples.getById(id) };
  });

  disciple = computed(() => this.discipleResource.value()?.data ?? null);
  isLoadingDisciple = computed(() => this.discipleResource.isLoading());
  discipleError = computed(() => this.discipleResource.error());

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

    if (criteria.firstName) params['firstName'] = criteria.firstName;
    if (criteria.lastName) params['lastName'] = criteria.lastName;
    if (criteria.spiritualLevel) params['spiritualLevel'] = criteria.spiritualLevel;
    if (criteria.maritalStatus) params['maritalStatus'] = criteria.maritalStatus;
    if (criteria.page !== undefined) params['page'] = criteria.page;
    if (criteria.size !== undefined) params['size'] = criteria.size;
    if (criteria.sortField) params['sortField'] = criteria.sortField;
    if (criteria.sortDirection) params['sortDirection'] = criteria.sortDirection;

    return params;
  }
}