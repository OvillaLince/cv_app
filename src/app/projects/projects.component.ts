import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

interface CodeFile {
  name: string;
  content: SafeHtml;
}

interface Project {
  title: string;
  image: string;
  safe_image_url?: SafeResourceUrl;
  codeFile: string;
  loaded_file: CodeFile | null;
}

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  dbProjects: Project[] = [];
  dsProjects: Project[] = [];
  isLoadingDB = true;
  isLoadingDS = true;


  constructor(private http: HttpClient, private sanitizer: DomSanitizer,private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.http.get<Project[]>('https://cv-app-backend.onrender.com/api/projects/db').subscribe(data => {
      this.dbProjects = data;
      this.loadProjectFiles(this.dbProjects);
    },
    (err) =>{
      this.isLoadingDB = false;
      console.error(err);
      this.snackBar.open('❌ Failed to load database projects', 'Close', { duration: 3000 });
    },
    () => {
      this.isLoadingDB = false;
      this.snackBar.open('Database Projects loaded successfully ✅', 'Close', { duration: 2500 });
    });
    this.http.get<Project[]>('https://cv-app-backend.onrender.com/api/projects/ds').subscribe(data => {
      this.dsProjects = data;
      this.loadProjectFiles(this.dsProjects);
    },
    (err) =>{
      this.isLoadingDS = false;
      console.error(err);
      this.snackBar.open('❌ Failed to load data science projects', 'Close', { duration: 3000 });
    },
    () => {
      this.isLoadingDS = false;
      this.snackBar.open('Data Science Projects loaded successfully ✅', 'Close', { duration: 2500 });
    });
  }

  loadProjectFiles(projects: Project[]) {
    for (const project of projects) {
      const path = project.codeFile;

      // ✅ Trust image/pdf path
      if (project.image != 'NULL') {
        project.safe_image_url = this.sanitizer.bypassSecurityTrustResourceUrl(project.image);
      }

      // ✅ Use Binder link for .ipynb files
      if (path != 'NULL' && path.endsWith('.ipynb')) {
        const filename = this.getFilename(path);
        const binderURL = `https://mybinder.org/v2/gh/OvillaLince/cv_app/main?filepath=notebooks/https://raw.githubusercontent.com/OvillaLince/cv_app/main/notebooks/${filename}`;

        const buttonHTML = `
          <a href="${binderURL}" target="_blank" rel="noopener" class="binder-launch">
            🚀 Open Notebook in Binder
          </a>
        `;

        project.loaded_file = {
          name: filename,
          content: this.sanitizer.bypassSecurityTrustHtml(buttonHTML)
        };
      }

      // ✅ Handle .sql or .txt files
      else if (path != 'NULL' && path.endsWith('.sql') || path.endsWith('.txt')) {
        this.http.get(path, { responseType: 'text' }).subscribe({
          next: content => {
            project.loaded_file = {
              name: this.getFilename(path),
              content: this.sanitizer.bypassSecurityTrustHtml(
                `<pre class="plain-code">${this.escapeHtml(content)}</pre>`
              )
            };
          },
          error: err => console.error(`Error loading ${path}`, err)
        });
      }
    }
  }

  escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  getFilename(path: string): string {
    return path.split('/').pop() || '';
  }
  public isPdf(path: string | null | undefined): boolean {
    return !!path && path.trim().toLowerCase().endsWith('.pdf');
  }
  isMobile(): boolean {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
}
