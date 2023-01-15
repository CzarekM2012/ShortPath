import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AlgorithmChoiceComponent} from './components/algorithm-choice/algorithm-choice.component';
import {AlgorithmVisualizerComponent} from './components/algorithm-visualizer/algorithm-visualizer.component';
import {TitleCardComponent} from './components/title-card/title-card.component';

const routes: Routes = [
  {path: '', component: TitleCardComponent},
  {path: 'titleCard', component: TitleCardComponent},
  {path: 'choice', component: AlgorithmChoiceComponent},
  {path: 'visualisation', component: AlgorithmVisualizerComponent},
];

@NgModule({imports: [RouterModule.forRoot(routes)], exports: [RouterModule]})
export class AppRoutingModule {
}
