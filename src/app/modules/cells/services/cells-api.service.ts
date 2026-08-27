import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '@core/config/api-endpoints.config';
import { ApiResponse } from '@core/types/api-response.types';
import { 
  CellAddMemberRequest,
  CellMoveMemberRequest,
  CellRegisterRequest,
  CellUpdateRequest 
} from '@modules/cells/types/cell-request.types';
import { CellMemberResponse, CellResponse } from '@modules/cells/types/cell-response.types';

@Service()
export class CellsApiService {

  private readonly http = inject(HttpClient);
  private readonly endpoints = inject(ApiEndpoints);

  register(request: CellRegisterRequest): Observable<ApiResponse<CellResponse>> {
    return this.http.post<ApiResponse<CellResponse>>(
      this.endpoints.cellGroups.register,
      request
    );
  }

  update(id: number, request: CellUpdateRequest): Observable<ApiResponse<CellResponse>> {
    return this.http.put<ApiResponse<CellResponse>>(
      this.endpoints.cellGroups.update(id),
      request
    );
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(this.endpoints.cellGroups.delete(id));
  }

  exportExcel(name?: string, leaderName?: string, meetingDay?: string): Observable<Blob> {
    const params: Record<string, string> = {};
    if (name) params['name'] = name;
    if (leaderName) params['leaderName'] = leaderName;
    if (meetingDay) params['meetingDay'] = meetingDay;

    return this.http.get(this.endpoints.cellGroups.exportExcel, {
      params,
      responseType: 'blob',
    });
  }

  addMember(cellId: number, request: CellAddMemberRequest): Observable<ApiResponse<CellMemberResponse>> {
    return this.http.post<ApiResponse<CellMemberResponse>>(
      this.endpoints.cellGroups.members(cellId),
      request
    );
  }

  removeMember(cellId: number, discipleId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      this.endpoints.cellGroups.removeMember(cellId, discipleId)
    );
  }

  moveMember(cellId: number, discipleId: number, request: CellMoveMemberRequest): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(
      this.endpoints.cellGroups.moveMember(cellId, discipleId),
      request
    );
  }

  markCoreTwelve(cellId: number, discipleId: number): Observable<ApiResponse<CellMemberResponse>> {
    return this.http.patch<ApiResponse<CellMemberResponse>>(
      this.endpoints.cellGroups.markCoreTwelve(cellId, discipleId),
      {}
    );
  }

  unmarkCoreTwelve(cellId: number, discipleId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      this.endpoints.cellGroups.unmarkCoreTwelve(cellId, discipleId)
    );
  }

  markPastorCoreTwelve(cellId: number, discipleId: number): Observable<ApiResponse<CellMemberResponse>> {
    return this.http.patch<ApiResponse<CellMemberResponse>>(
      this.endpoints.cellGroups.markPastorCoreTwelve(cellId, discipleId),
      {}
    );
  }

  unmarkPastorCoreTwelve(cellId: number, discipleId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      this.endpoints.cellGroups.unmarkPastorCoreTwelve(cellId, discipleId)
    );
  }
}