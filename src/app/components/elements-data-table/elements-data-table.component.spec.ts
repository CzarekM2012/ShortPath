import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementsDataTableComponent } from './elements-data-table.component';

describe('ElementsDataTableComponent', () => {
  let component: ElementsDataTableComponent;
  let fixture: ComponentFixture<ElementsDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElementsDataTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElementsDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
