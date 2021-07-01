import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeeAssisstantComponent } from './bee-assisstant.component';

describe('BeeAssisstantComponent', () => {
  let component: BeeAssisstantComponent;
  let fixture: ComponentFixture<BeeAssisstantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeeAssisstantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeeAssisstantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
