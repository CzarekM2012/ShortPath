import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphElementParametersDisplayComponent } from './graph-element-parameters-display.component';

describe('GraphElementParametersDisplayComponent', () => {
  let component: GraphElementParametersDisplayComponent;
  let fixture: ComponentFixture<GraphElementParametersDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphElementParametersDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphElementParametersDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
