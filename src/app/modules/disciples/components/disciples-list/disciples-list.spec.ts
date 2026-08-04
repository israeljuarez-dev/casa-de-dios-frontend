import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisciplesList } from './disciples-list';

describe('DisciplesList', () => {
  let component: DisciplesList;
  let fixture: ComponentFixture<DisciplesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisciplesList],
    }).compileComponents();

    fixture = TestBed.createComponent(DisciplesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
