import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {GraphDisplayComponent} from './components/graph-display/graph-display.component';
import {GUIComponent} from './components/gui/gui.component';

@NgModule({
  declarations: [AppComponent, GraphDisplayComponent, GUIComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
