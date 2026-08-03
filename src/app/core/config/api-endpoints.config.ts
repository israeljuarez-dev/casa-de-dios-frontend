import { Service } from '@angular/core';

@Service()
export class ApiEndpoints {
  private readonly baseUrl = 'http://localhost:8080/v1';

  readonly auth = {
    login: `${this.baseUrl}/auth/login`,
    register: `${this.baseUrl}/auth/register`,
    me: `${this.baseUrl}/auth/me`,
    changePassword: `${this.baseUrl}/auth/change-password`,
  };
}