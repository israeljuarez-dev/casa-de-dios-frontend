import { Service } from '@angular/core';

@Service()
export class ApiEndpoints {
  private readonly baseUrl = 'http://localhost:8080/v1';

  readonly auth = {
    login: `${this.baseUrl}/auth/login`,
    me: `${this.baseUrl}/auth/me`,
    register: `${this.baseUrl}/auth/register`,
    changePassword: `${this.baseUrl}/auth/change-password`,
  };

  readonly disciples = {
    list: `${this.baseUrl}/disciples`,
    getById: (id: number) => `${this.baseUrl}/disciples/${id}`,
    register: `${this.baseUrl}/disciples`,
    update: (id: number) => `${this.baseUrl}/disciples/${id}`,
    delete: (id: number) => `${this.baseUrl}/disciples/${id}`,
    exportExcel: `${this.baseUrl}/disciples/export/excel`,
  };

  readonly cellGroups = {
    list:                   `${this.baseUrl}/cell-groups`,
    getById:                (id: number) => `${this.baseUrl}/cell-groups/${id}`,
    register:               `${this.baseUrl}/cell-groups`,
    update:                 (id: number) => `${this.baseUrl}/cell-groups/${id}`,
    delete:                 (id: number) => `${this.baseUrl}/cell-groups/${id}`,
    exportExcel:            `${this.baseUrl}/cell-groups/export/excel`,
    pastorCoreTwelve:       `${this.baseUrl}/cell-groups/pastor-core-twelve`,
    members:                (id: number) => `${this.baseUrl}/cell-groups/${id}/members`,
    removeMember:           (id: number, discipleId: number) => `${this.baseUrl}/cell-groups/${id}/members/${discipleId}`,
    moveMember:             (id: number, discipleId: number) => `${this.baseUrl}/cell-groups/${id}/members/${discipleId}/move`,
    markCoreTwelve:         (id: number, discipleId: number) => `${this.baseUrl}/cell-groups/${id}/members/${discipleId}/core-twelve`,
    unmarkCoreTwelve:       (id: number, discipleId: number) => `${this.baseUrl}/cell-groups/${id}/members/${discipleId}/core-twelve`,
    markPastorCoreTwelve:   (id: number, discipleId: number) => `${this.baseUrl}/cell-groups/${id}/members/${discipleId}/pastor-core-twelve`,
    unmarkPastorCoreTwelve: (id: number, discipleId: number) => `${this.baseUrl}/cell-groups/${id}/members/${discipleId}/pastor-core-twelve`,
  };
}