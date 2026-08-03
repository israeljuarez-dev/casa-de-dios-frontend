import { HttpClient } from '@angular/common/http';
import { 
    Service, 
    computed, 
    inject, 
    signal 
} from '@angular/core';
import { ApiEndpoints } from '@core/config/api-endpoints.config';
import { ApiErrorResponse, ApiResponse } from '@core/types/api-response.types';
import { TokenService } from '@core/auth/services/token.service';
import { LoginRequest } from '@modules/auth/types/auth-request.types';
import { LoginResponseData } from '@modules/auth/types/auth-response.types';

@Service()
export class AuthService {

  private http = inject(HttpClient);

  private endpoints = inject(ApiEndpoints);

  private tokenService = inject(TokenService);

  private loadingSignal = signal(false);

  private errorSignal = signal<string | null>(null);

  isLoading = computed(() => this.loadingSignal());
  
  error = computed(() => this.errorSignal());

  login(usernameOrEmail: string, password: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const body: LoginRequest = { usernameOrEmail, password };

    this.http
      .post<ApiResponse<LoginResponseData>>(this.endpoints.auth.login, body)
      .subscribe({
        next: (response) => {
          this.tokenService.setToken(response.data.jwt);
          this.loadingSignal.set(false);
        },
        error: (httpError) => {
          const apiError = httpError.error as ApiErrorResponse;
          this.errorSignal.set(apiError?.message ?? 'Ocurrió un error inesperado. Intenta de nuevo.');
          this.loadingSignal.set(false);
        },
      });
  }
}