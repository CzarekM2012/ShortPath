import { TestBed } from '@angular/core/testing';

import { ChangeEmitterService } from './change-emitter.service';

describe('ChangeEmitterService', () => {
  let service: ChangeEmitterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangeEmitterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
