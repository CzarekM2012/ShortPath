import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GraphDisplayComponent} from './graph-display.component';

describe('GraphDisplayComponent', () => {
  let component: GraphDisplayComponent;
  let fixture: ComponentFixture<GraphDisplayComponent>;

  beforeEach(async () => {
    await TestBed
        .configureTestingModule({declarations: [GraphDisplayComponent]})
        .compileComponents();

    fixture = TestBed.createComponent(GraphDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
