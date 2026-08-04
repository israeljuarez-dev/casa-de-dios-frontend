import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscipleDetail } from './disciple-detail';

describe('DiscipleDetail', () => {
  let component: DiscipleDetail;
  let fixture: ComponentFixture<DiscipleDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscipleDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscipleDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
