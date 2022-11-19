import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ElementInfoDisplayComponent} from './element-info-display.component';

describe('ElementInfoDisplayComponent', () => {
  let component: ElementInfoDisplayComponent;
  let fixture: ComponentFixture<ElementInfoDisplayComponent>;

  beforeEach(async () => {
    await TestBed
        .configureTestingModule({declarations: [ElementInfoDisplayComponent]})
        .compileComponents();

    fixture = TestBed.createComponent(ElementInfoDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have data display', () => {
    expect(component.display).toBeDefined();
  });
});
