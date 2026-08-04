import { Component, signal } from '@angular/core';

type HomeModalKey = 'growth' | 'leadership' | 'birthdays' | null;

interface NewDiscipleMock {
  fullName: string;
  registeredAt: string;
}

interface ActiveLeaderMock {
  firstName: string;
  lastName: string;
  cellGroupName: string;
}

interface BirthdayMock {
  firstName: string;
  lastName: string;
  cellGroupName: string;
}

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  activeModal = signal<HomeModalKey>(null);

  // NOTA: datos de ejemplo, temporales. Se reemplazan por datos reales
  // en cuanto el backend exponga los endpoints de estadísticas del dashboard.
  newDisciplesThisMonth = signal<NewDiscipleMock[]>([
    { fullName: 'Beatriz Salazar', registeredAt: '02 Oct 2026' },
    { fullName: 'Jorge Hernández', registeredAt: '05 Oct 2026' },
    { fullName: 'Claudia Portillo', registeredAt: '08 Oct 2026' },
    { fullName: 'Samuel Menéndez', registeredAt: '10 Oct 2026' },
  ]);

  activeLeaders = signal<ActiveLeaderMock[]>([
    { firstName: 'Carlos', lastName: 'Pérez', cellGroupName: 'Sión' },
    { firstName: 'Martha', lastName: 'Martínez', cellGroupName: 'Liderazgo Alpha' },
    { firstName: 'David', lastName: 'López', cellGroupName: 'Roca Firme' },
    { firstName: 'Sara', lastName: 'Castillo', cellGroupName: 'Nueva Esperanza' },
  ]);

  birthdaysThisWeek = signal<BirthdayMock[]>([
    { firstName: 'Ana', lastName: 'Gómez', cellGroupName: 'Sión' },
    { firstName: 'Luis', lastName: 'Ramírez', cellGroupName: 'Roca Firme' },
  ]);

  openModal(key: HomeModalKey): void {
    this.activeModal.set(key);
  }

  closeModal(): void {
    this.activeModal.set(null);
  }
}
