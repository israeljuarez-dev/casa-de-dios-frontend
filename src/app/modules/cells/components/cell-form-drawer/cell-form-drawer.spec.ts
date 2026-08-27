import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellFormDrawer } from './cell-form-drawer';

describe('CellFormDrawer', () => {
  let component: CellFormDrawer;
  let fixture: ComponentFixture<CellFormDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellFormDrawer],
    }).compileComponents();

    fixture = TestBed.createComponent(CellFormDrawer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
