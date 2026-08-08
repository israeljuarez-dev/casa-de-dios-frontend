import { 
    Service, 
    computed, 
    signal 
} from '@angular/core';

const TOKEN_STORAGE_KEY = 'casa_de_dios_access_token';

interface DecodedJwtPayload {
  exp?: number;
}

@Service()
export class TokenService {

  private tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));

  token = computed(() => this.tokenSignal());
  
  isAuthenticated = computed(() => {
    const currentToken = this.tokenSignal();
    if (!currentToken) return false;
    return !this.isTokenExpired(currentToken);
  });

  setToken(token: string): void {
    this.tokenSignal.set(token);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  clearToken(): void {
    this.tokenSignal.set(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    if (!payload?.exp) return true;

    const expirationTimeMs = payload.exp * 1000;
    return Date.now() >= expirationTimeMs;
  }

  private decodeJwtPayload(token: string): DecodedJwtPayload | null {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(payloadJson);
    } catch {
      return null;
    }
  }
}