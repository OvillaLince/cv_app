import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsComponent } from './projects/projects.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: ' ', redirectTo: 'home' },                     // Redirect unknown paths to home
  { path: 'home', component: HomeComponent },
  { path: 'home/projects', component: ProjectsComponent },
  // Optional: Wildcard for 404
  { path: '**', redirectTo: 'home' }                       // Redirect unknown paths to home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
