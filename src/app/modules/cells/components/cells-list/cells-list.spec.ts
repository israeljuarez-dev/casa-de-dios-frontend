import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellsList } from './cells-list';

describe('CellsList', () => {
  let component: CellsList;
  let fixture: ComponentFixture<CellsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellsList],
    }).compileComponents();

    fixture = TestBed.createComponent(CellsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
