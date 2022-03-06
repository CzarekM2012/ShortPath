import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StandardInteractiveGraphComponent } from './standard-interactive-graph/standard-interactive-graph.component'

const routes: Routes = [
    {path: '', component: StandardInteractiveGraphComponent},
    {path: 'standard', component: StandardInteractiveGraphComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
