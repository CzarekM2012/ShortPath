import { TestBed } from '@angular/core/testing';

import { BaseGraphAlgorithmService } from './base-graph-algorithm.service';

describe('BaseGraphAlgorithmService', () => {
  let service: BaseGraphAlgorithmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseGraphAlgorithmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
