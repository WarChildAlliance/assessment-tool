import { TestBed } from '@angular/core/testing';

import { TutorialSlideshowService } from './tutorial-slideshow.service';

describe('TutorialSlideshowService', () => {
  let service: TutorialSlideshowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutorialSlideshowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
