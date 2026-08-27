import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellCard } from './cell-card';

describe('CellCard', () => {
  let component: CellCard;
  let fixture: ComponentFixture<CellCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellCard],
    }).compileComponents();

    fixture = TestBed.createComponent(CellCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
