import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastorCells } from './pastor-cells';

describe('PastorCells', () => {
  let component: PastorCells;
  let fixture: ComponentFixture<PastorCells>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastorCells],
    }).compileComponents();

    fixture = TestBed.createComponent(PastorCells);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
