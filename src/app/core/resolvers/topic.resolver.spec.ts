import { TestBed } from '@angular/core/testing';

import { TopicResolver } from './topic.resolver';

describe('TopicResolver', () => {
  let resolver: TopicResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(TopicResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
