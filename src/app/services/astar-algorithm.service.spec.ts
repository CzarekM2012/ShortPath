import { TestBed } from '@angular/core/testing';

import { AStarAlgorithmService } from './astar-algorithm.service';

describe('AStarAlgorithmService', () => {
  let service: AStarAlgorithmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AStarAlgorithmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
