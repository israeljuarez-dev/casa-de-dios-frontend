import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '@core/config/api-endpoints.config';
import { ApiResponse } from '@core/types/api-response.types';
import { 
  DiscipleRegisterRequest, 
  DiscipleSearchCriteria, 
  DiscipleUpdateRequest 
} from '@modules/disciples/types/disciple-request.types';
import { DiscipleResponse } from '@modules/disciples/types/disciple-response.types';

@Service()
export class DisciplesApiService {
    
  private http = inject(HttpClient);

  private endpoints = inject(ApiEndpoints);

  register(request: DiscipleRegisterRequest): Observable<ApiResponse<DiscipleResponse>> {
    return this.http.post<ApiResponse<DiscipleResponse>>(this.endpoints.disciples.register, request);
  }

  update(id: number, request: DiscipleUpdateRequest): Observable<ApiResponse<DiscipleResponse>> {
    return this.http.put<ApiResponse<DiscipleResponse>>(this.endpoints.disciples.update(id), request);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(this.endpoints.disciples.delete(id));
  }

  exportExcel(criteria: Partial<DiscipleSearchCriteria>): Observable<Blob> {
    let params = new HttpParams();
    if (criteria.firstName) params = params.set('firstName', criteria.firstName);
    if (criteria.lastName) params = params.set('lastName', criteria.lastName);
    if (criteria.gender) params = params.set('gender', criteria.gender);
    if (criteria.spiritualLevel) params = params.set('spiritualLevel', criteria.spiritualLevel);
    if (criteria.maritalStatus) params = params.set('maritalStatus', criteria.maritalStatus);

    return this.http.get(this.endpoints.disciples.exportExcel, {
      params,
      responseType: 'blob',
    });
  }
}