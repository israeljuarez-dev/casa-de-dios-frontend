import { HttpClient, httpResource } from '@angular/common/http';
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
import { LoginResponseData, UserProfileResponse } from '@modules/auth/types/auth-response.types';

@Service()
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly endpoints = inject(ApiEndpoints);
  private readonly tokenService = inject(TokenService);

  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  isLoading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());

  currentUser = computed(() => this.meResource.value()?.data ?? null);

  private meResource = httpResource<ApiResponse<UserProfileResponse>>(() => {
    return this.tokenService.isAuthenticated() ? { url: this.endpoints.auth.me } : undefined;
  });

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