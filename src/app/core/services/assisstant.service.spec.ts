import { TestBed } from '@angular/core/testing';
import { AssisstantService } from './assisstant.service';

describe('AssisstantService', () => {
  let service: AssisstantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssisstantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
