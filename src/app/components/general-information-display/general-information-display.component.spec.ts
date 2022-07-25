import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralInformationDisplayComponent } from './general-information-display.component';

describe('GeneralInformationDisplayComponent', () => {
  let component: GeneralInformationDisplayComponent;
  let fixture: ComponentFixture<GeneralInformationDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralInformationDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralInformationDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
