import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';

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
  isLoadingDB = false;
  isLoadingDS = false;
  selectedTabIndex = 0;
  openedDsPanels = new Set<number>();

  activeNotebook: string | null = null;
  trustedNotebookUrl: SafeResourceUrl | null = null;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadDbProjects();
  }

  loadDbProjects(): void {
    this.isLoadingDB = true;
    this.http.get<Project[]>('https://cv-app-backend.onrender.com/api/projects/db')
      .subscribe({
        next: (response) => {
          this.dbProjects = response;
          this.loadProjectFiles(this.dbProjects);
          this.snackBar.open('All projects loaded successfully ✅', 'Close', { duration: 2500 });
        },
        error: (err) => {
          console.error('All projects error:', err);
          this.loadDbProjects();
        },
        complete: () => {
          this.isLoadingDB = false;
        }
      });
  }

  loadDsProjects(): void {
    this.isLoadingDS = true;
    this.http.get<Project[]>('https://cv-app-backend.onrender.com/api/project/ds')
      .subscribe({
        next: (response) => {
          this.dsProjects = response;
          this.loadProjectFiles(this.dsProjects);
          this.snackBar.open('All projects loaded successfully ✅', 'Close', { duration: 2500 });
        },
        error: (err) => {
          console.error('All projects error:', err);
          this.loadDsProjects();
        },
        complete: () => {
          this.isLoadingDS = false;
        }
      });
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.selectedTabIndex = event.index;
    if (event.index === 0 && this.dbProjects.length === 0) {
      this.loadDbProjects();
    } else if (event.index === 1 && this.dsProjects.length === 0) {
      this.loadDsProjects();
    }
  }

  loadProjectFiles(projects: Project[]) {
    for (const project of projects) {
      const path = project.codeFile;

      if (project.image !== 'NULL') {
        project.safe_image_url = this.sanitizer.bypassSecurityTrustResourceUrl(project.image);
      }

      if (path !== 'NULL' && (path.endsWith('.sql') || path.endsWith('.txt'))) {
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

  openNotebook(path: string, project: Project): void {
    const filename = this.getFilename(path);
    this.activeNotebook = path;  // key change here
    const jliteurl = `https://ovillalince.github.io/cv_app/assets/jupyterlite/index.html?url=files/${filename}`;
    this.trustedNotebookUrl = this.sanitizer.bypassSecurityTrustResourceUrl(jliteurl);
  }

  closeNotebook(): void {
    this.activeNotebook = null;
    this.trustedNotebookUrl = null;
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

  onPanelOpened(index: number): void {
    this.openedDsPanels.add(index);
  }
}
