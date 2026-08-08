import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitedByPicker } from './invited-by-picker';

describe('InvitedByPicker', () => {
  let component: InvitedByPicker;
  let fixture: ComponentFixture<InvitedByPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitedByPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(InvitedByPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
