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
  isLoading = false;
  retryCount = 0;
  MAX_RETRIES = 3;
  RETRY_DELAY_MS = 3000;
  openedDsPanels = new Set<number>();
  
  constructor(private http: HttpClient, private sanitizer: DomSanitizer,private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadProjects();
  }
  loadProjects(): void {
    if (this.retryCount >= this.MAX_RETRIES) {
      console.warn('❌ Max retry attempts reached.');
      return;
    }
  
    this.isLoading = true;
  
    const timeoutId = setTimeout(() => {
      sub.unsubscribe();
      this.snackBar.open('⏱️ Project request timed out after 10s', 'Close', { duration: 3000 });
      this.scheduleRetry();
    }, 10000);
  
    const sub = this.http.get<{ dbProjects: Project[]; dsProjects: Project[] }>('https://cv-app-backend.onrender.com/api/projects/all')
      .subscribe({
        next: (response) => {
          clearTimeout(timeoutId);
          this.dbProjects = response.dbProjects;
          this.dsProjects = response.dsProjects;
  
          this.loadProjectFiles(this.dbProjects);
          this.loadProjectFiles(this.dsProjects);
  
          this.snackBar.open('All projects loaded successfully ✅', 'Close', { duration: 2500 });
        },
        error: (err) => {
          clearTimeout(timeoutId);
          console.error('All projects error:', err);
          this.snackBar.open('❌ Failed to load projects', 'Close', { duration: 3000 });
          this.scheduleRetry();
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
  
  scheduleRetry(): void {
    this.retryCount++;
    if (this.retryCount <= this.MAX_RETRIES) {
      console.warn(`🔁 Retrying (${this.retryCount}/${this.MAX_RETRIES}) in ${this.RETRY_DELAY_MS / 1000}s...`);
      setTimeout(() => this.refresh(), this.RETRY_DELAY_MS);
    } else {
      this.snackBar.open('❌ Max retries exceeded. No further attempts will be made, Please refresh page if connection is working.','Close', { duration: 3000 });
    }
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
        const jliteurl = `cv_app/assets/jupyterlite/index.html?path=files/${filename}`;
        const fileHTML = `
          <iframe
            src="${jliteurl}"
            width="100%"
            height="600px"
            frameborder="0">
          </iframe>
        `;
        project.loaded_file = {
          name: filename,
          content: this.sanitizer.bypassSecurityTrustHtml(fileHTML)
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
  refresh(){
    this.loadProjects();
  }
  onPanelOpened(index: number): void {
    this.openedDsPanels.add(index);
  }
}
