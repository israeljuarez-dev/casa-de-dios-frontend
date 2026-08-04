import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '@core/config/api-endpoints.config';
import { ApiResponse } from '@core/types/api-response.types';
import { DiscipleRegisterRequest, DiscipleUpdateRequest } from '@modules/disciples/types/disciple-request.types';
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
}