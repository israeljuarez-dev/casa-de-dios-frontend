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
}