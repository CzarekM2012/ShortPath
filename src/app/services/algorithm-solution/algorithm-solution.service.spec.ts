import { TestBed } from '@angular/core/testing';

import { AlgorithmSolutionService } from './algorithm-solution.service';

describe('AlgorithmSolutionService', () => {
  let service: AlgorithmSolutionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlgorithmSolutionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
