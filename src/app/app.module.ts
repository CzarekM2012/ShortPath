import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GeneralInformationDisplayComponent } from './components/general-information-display/general-information-display.component';
import { GraphElementParametersDisplayComponent } from './components/graph-element-parameters-display/graph-element-parameters-display.component';
import { GraphDisplayComponent } from './components/graph-display/graph-display.component';
import { GUIComponent } from './components/gui/gui.component';

@NgModule({
  declarations: [
    AppComponent,
    GeneralInformationDisplayComponent,
    GraphElementParametersDisplayComponent,
    GraphDisplayComponent,
    GUIComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
