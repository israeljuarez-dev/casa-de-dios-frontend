import { 
  Component, 
  computed, 
  inject 
} from '@angular/core';
import { 
  Router, 
  RouterLink, 
  RouterOutlet 
} from '@angular/router';
import { TokenService } from '@core/auth/services/token.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

  private router = inject(Router);

  private tokenService = inject(TokenService);

  navItems: NavItem[] = [
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

  currentRoute = computed(() => this.router.url);

  logout(): void {
    this.tokenService.clearToken();
    this.router.navigate(['/login']);
  }
}
