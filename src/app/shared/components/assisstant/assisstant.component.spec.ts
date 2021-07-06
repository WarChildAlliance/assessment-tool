import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssisstantComponent } from './assisstant.component';

describe('AssisstantComponent', () => {
  let component: AssisstantComponent;
  let fixture: ComponentFixture<AssisstantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssisstantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssisstantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
