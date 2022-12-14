import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmChoiceComponent } from './algorithm-choice.component';

describe('AlgorithmChoiceComponent', () => {
  let component: AlgorithmChoiceComponent;
  let fixture: ComponentFixture<AlgorithmChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlgorithmChoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlgorithmChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
