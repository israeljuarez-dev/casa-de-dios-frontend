import { 
    Service, 
    computed, 
    signal 
} from '@angular/core';

const TOKEN_STORAGE_KEY = 'casa_de_dios_access_token';

@Service()
export class TokenService {
  private tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));

  token = computed(() => this.tokenSignal());
  isAuthenticated = computed(() => this.tokenSignal() !== null);

  setToken(token: string): void {
    this.tokenSignal.set(token);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  clearToken(): void {
    this.tokenSignal.set(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}