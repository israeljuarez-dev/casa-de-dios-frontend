import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscipleForm } from './disciple-form';

describe('DiscipleForm', () => {
  let component: DiscipleForm;
  let fixture: ComponentFixture<DiscipleForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscipleForm],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscipleForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
