import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InteractiveGraphModule} from 'interactive-graph';
import { StandardInteractiveGraphComponent } from './standard-interactive-graph/standard-interactive-graph.component';

@NgModule({
  declarations: [
    AppComponent,
    StandardInteractiveGraphComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    InteractiveGraphModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
