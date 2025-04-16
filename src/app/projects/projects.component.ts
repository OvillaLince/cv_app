import { Component } from '@angular/core';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  // Data Science–related projects
  dsProjects = [
    {
      title: 'Delivery Optimization System',
      description: 'Geolocation-based tracking for trucks and dynamic route prediction using .NET and Angular.'
    },
    {
      title: 'Client Dashboard App',
      description: 'Interactive client portal for live delivery and route tracking integrated with Geotab.'
    }
  ];

  // Database/Backend-related projects
  dbProjects = [
    {
      title: 'Invoice PDF Generator',
      description: 'Converted live invoice data into downloadable PDF reports using PDFSharp and DotLiquid.'
    }
  ];
}


