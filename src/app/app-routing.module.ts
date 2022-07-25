import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GUIComponent } from './components/gui/gui.component';

const routes: Routes = [
  {path: '', component: GUIComponent},
  {path: 'standard', component: GUIComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
