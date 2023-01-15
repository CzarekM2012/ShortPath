import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AlgorithmChoiceComponent} from './components/algorithm-choice/algorithm-choice.component';
import {AlgorithmControllerComponent} from './components/algorithm-controller/algorithm-controller.component';
import {AlgorithmVisualizerComponent} from './components/algorithm-visualizer/algorithm-visualizer.component';
import {ElementInfoDisplayComponent} from './components/element-info-display/element-info-display.component';
import {ElementsDataTableComponent} from './components/elements-data-table/elements-data-table.component';
import {GraphDisplayComponent} from './components/graph-display/graph-display.component';
import {PageTemplateComponent} from './components/page-template/page-template.component';
import {TitleCardComponent} from './components/title-card/title-card.component';

@NgModule({
  declarations: [
    AppComponent, GraphDisplayComponent, ElementInfoDisplayComponent,
    AlgorithmControllerComponent, AlgorithmChoiceComponent,
    AlgorithmVisualizerComponent, ElementsDataTableComponent,
    PageTemplateComponent, TitleCardComponent
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
