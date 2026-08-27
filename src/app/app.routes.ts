import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () =>
      import('@shared/components/main-layout/main-layout').then(
        (m) => m.MainLayout
      ),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('@modules/home/components/home/home').then((m) => m.Home),
      },
      {
        path: 'disciples',
        loadComponent: () =>
          import(
            '@modules/disciples/components/disciples-list/disciples-list'
          ).then((m) => m.DisciplesList),
      },
      {
        path: 'disciples/:id',
        loadComponent: () =>
          import(
            '@modules/disciples/components/disciple-detail/disciple-detail'
          ).then((m) => m.DiscipleDetail),
      },
      {
        path: 'cell-groups',
        loadComponent: () =>
          import('@modules/cells/components/cells-list/cells-list').then(
            (m) => m.CellsList
          ),
      },
      {
        path: 'cell-groups/pastor',
        loadComponent: () =>
          import('@modules/cells/components/pastor-cells/pastor-cells').then(
            (m) => m.PastorCells
          ),
      },
      {
        path: 'cell-groups/:id',
        loadComponent: () =>
          import('@modules/cells/components/cell-detail/cell-detail').then(
            (m) => m.CellDetail
          ),
      },
    ],
  },
];