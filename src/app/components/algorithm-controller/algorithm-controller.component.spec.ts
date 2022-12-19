import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AlgorithmControllerComponent} from './algorithm-controller.component';

describe('AlgorithmControllerComponent', () => {
  let component: AlgorithmControllerComponent;
  let fixture: ComponentFixture<AlgorithmControllerComponent>;

  beforeEach(async () => {
    await TestBed
        .configureTestingModule({declarations: [AlgorithmControllerComponent]})
        .compileComponents();

    fixture = TestBed.createComponent(AlgorithmControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have algorithm execution button', () => {
    expect(component.algorithmExecution).toBeDefined();
  });

  it('should have algorithm reset button', () => {
    expect(component.resetGraph).toBeDefined();
  });

  it('should have step number input', () => {
    expect(component.stepsInput).toBeDefined();
  });

  it('should have move forward button', () => {
    expect(component.forwardButton).toBeDefined();
  });

  it('should have move backward button', () => {
    expect(component.backwardButton).toBeDefined();
  });
});
