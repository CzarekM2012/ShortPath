import { TestBed } from '@angular/core/testing';

import { DjikstraAlgorithmService } from './djikstra-algorithm.service';

describe('DjikstraAlgorithmService', () => {
  let service: DjikstraAlgorithmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DjikstraAlgorithmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
