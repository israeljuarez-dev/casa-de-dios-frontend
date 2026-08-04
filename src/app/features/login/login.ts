import { 
  Component, 
  effect, 
  inject, 
  signal 
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@modules/auth/services/auth.service';
import { TokenService } from '@core/auth/services/token.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private authService = inject(AuthService);

  private tokenService = inject(TokenService);

  private router = inject(Router);

  usernameOrEmail = signal<string>('');

  password = signal<string>('');

  isPasswordVisible = signal<boolean>(false);

  loginSucceeded = signal<boolean>(false);

  isLoading = this.authService.isLoading;

  errorMessage = this.authService.error;

  constructor() {
    effect(() => {
      if (this.tokenService.isAuthenticated() && !this.loginSucceeded()) {
        this.loginSucceeded.set(true);
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1200);
      }
    });
  }

  onSubmit(): void {
    this.authService.login(this.usernameOrEmail(), this.password());
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible.update((visible) => !visible);
  }
}