import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveMemberDialog } from './move-member-dialog';

describe('MoveMemberDialog', () => {
  let component: MoveMemberDialog;
  let fixture: ComponentFixture<MoveMemberDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveMemberDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(MoveMemberDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
