import { TestBed } from '@angular/core/testing';

import { GraphStorageService } from './graph-storage.service';

describe('GraphStorageService', () => {
  let service: GraphStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
