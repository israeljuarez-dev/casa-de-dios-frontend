import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportExcelButton } from './export-excel-button';

describe('ExportExcelButton', () => {
  let component: ExportExcelButton;
  let fixture: ComponentFixture<ExportExcelButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportExcelButton],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportExcelButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
