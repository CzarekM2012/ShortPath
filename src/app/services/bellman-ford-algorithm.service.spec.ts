import { TestBed } from '@angular/core/testing';

import { BellmanFordAlgorithmService } from './bellman-ford-algorithm.service';

describe('BellmanFordAlgorithmService', () => {
  let service: BellmanFordAlgorithmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BellmanFordAlgorithmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
