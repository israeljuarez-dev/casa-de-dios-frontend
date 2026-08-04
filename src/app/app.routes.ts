import { Routes } from '@angular/router';
import { Login } from './modules/login/login';
import { MainLayout } from '@shared/components/main-layout/main-layout';
import { DisciplesList } from '@modules/disciples/components/disciples-list/disciples-list';
import { DiscipleDetail } from '@modules/disciples/components/disciple-detail/disciple-detail';
import { DiscipleForm } from '@modules/disciples/components/disciple-form/disciple-form';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'disciples', pathMatch: 'full' },
      { path: 'disciples', component: DisciplesList },
      { path: 'disciples/new', component: DiscipleForm },
      { path: 'disciples/:id/edit', component: DiscipleForm },
      { path: 'disciples/:id', component: DiscipleDetail },
    ],
  },
];