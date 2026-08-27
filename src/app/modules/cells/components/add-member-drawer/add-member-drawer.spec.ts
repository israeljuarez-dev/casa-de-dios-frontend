import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMemberDrawer } from './add-member-drawer';

describe('AddMemberDrawer', () => {
  let component: AddMemberDrawer;
  let fixture: ComponentFixture<AddMemberDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMemberDrawer],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMemberDrawer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
