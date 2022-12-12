import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AlgorithmControllerComponent} from './components/algorithm-controller/algorithm-controller.component';
import {ElementInfoDisplayComponent} from './components/element-info-display/element-info-display.component';
import {GraphDisplayComponent} from './components/graph-display/graph-display.component';
import {GUIComponent} from './components/gui/gui.component';

@NgModule({
  declarations: [
    AppComponent, GraphDisplayComponent, GUIComponent,
    ElementInfoDisplayComponent, AlgorithmControllerComponent
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
