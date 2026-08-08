import { 
  Component, 
  computed, 
  inject, 
  signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { 
  NavigationEnd,
  Router, 
  RouterLink, 
  RouterOutlet 
} from '@angular/router';
import { TokenService } from '@core/auth/services/token.service';
import { 
  filter, 
  map, 
  startWith 
} from 'rxjs';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}
import { AuthService } from '@modules/auth/services/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet, 
    RouterLink,
    ConfirmDialog
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);

  authService = inject(AuthService);

  navItems: NavItem[] = [
    { 
      label: 'Inicio', 
      icon: 'home', 
      route: '/home' 
    },
    { 
      label: 'Discípulos', 
      icon: 'group', 
      route: '/disciples' 
    },
    { 
      label: 'Células', 
      icon: 'diversity_3', 
      route: '/cell-groups' 
    },
    { 
      label: 
      'Escuela de Líderes', 
      icon: 'school', 
      route: '/leadership-school' 
    },
    { 
      label: 'Inventario', 
      icon: 'inventory_2', 
      route: '/inventory' 
    },
    {
      label: 'Finanzas', 
      icon: 'payments', 
      route: '/finance' 
    },
    { 
      label: 'Encuentros', 
      icon: 'hub', 
      route: '/encounters' 
    },
  ];

  currentRoute = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  showLogoutConfirm = signal<boolean>(false);

  requestLogout(): void {
    this.showLogoutConfirm.set(true);
  }

  confirmLogout(): void {
    this.showLogoutConfirm.set(false);
    this.tokenService.clearToken();
    this.router.navigate(['/login']);
  }

  cancelLogout(): void {
    this.showLogoutConfirm.set(false);
  }
}
