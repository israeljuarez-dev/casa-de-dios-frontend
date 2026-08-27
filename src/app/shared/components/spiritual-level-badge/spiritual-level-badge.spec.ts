import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpiritualLevelBadge } from './spiritual-level-badge';

describe('SpiritualLevelBadge', () => {
  let component: SpiritualLevelBadge;
  let fixture: ComponentFixture<SpiritualLevelBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpiritualLevelBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(SpiritualLevelBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
