import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MyApiService } from '../services/my-api.service';

interface CodeFile {
  name: string;
  content: SafeHtml;
}

interface Project {
  title: string;
  image?: string | null;
  safe_image_url?: SafeResourceUrl;
  codeFile?: string | null;
  loaded_file: CodeFile | null;
}

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
dbProjects: Project[] = [

  {
    title: 'Exam 1 – Advanced Databases',
    image: null,
    codeFile: 'assets/Exam1-AdvDBs.sql',
    loaded_file: null
  },
  {
    title: 'Project 1 – Advanced Databases',
    image: null,
    codeFile: 'assets/Project1-AdvDBs.txt',
    loaded_file: null
  },
  {
    title: 'Project 1 – Graph Databases',
    image: 'assets/Project1-GraphDbs.pdf',
    codeFile: null,
    loaded_file: null
  },
  {
    title: 'Project 2 – Graph Databases',
    image: 'assets/Project2-GraphDbs.pdf',
    codeFile: 'assets/Project2-GraphDbs.txt',
    loaded_file: null
  },
  {
    title: 'Project 3 – Graph Databases',
    image: 'assets/Project3-GraphDbs.pdf',
    codeFile: null,
    loaded_file: null
  },
  {
    title: 'Project 4 – Graph Databases',
    image: 'assets/Project4-GraphDbs.pdf',
    codeFile: null,
    loaded_file: null
  }

];
 dsProjects: Project[] = [

  // ===== PROJECT 1 =====

  {
    title: 'Project 1 – Data Mining Linear Models',
    image: 'assets/Project1-DataMiningLinearM.pdf',
    codeFile: 'assets/Project1-DataMiningLinearM.ipynb',
    loaded_file: null
  },
  {
    title: 'Project 1 – Data Visualization',
    image: null,
    codeFile: 'assets/Project1-DataVisualization.ipynb',
    loaded_file: null
  },

  // ===== PROJECT 2 =====

  {
    title: 'Project 2 – Data Mining',
    image: 'assets/Project2-DataMining.pdf',
    codeFile: 'assets/Project2-DataMining.ipynb',
    loaded_file: null
  },
  {
    title: 'Project 2 – Data Mining Linear Models',
    image: 'assets/Project2-DataMiningLinearM.pdf',
    codeFile: 'assets/Project2-DataMiningLinearM.ipynb',
    loaded_file: null
  },
  {
    title: 'Project 2 – Web Mining',
    image: 'assets/Project2-WebMining.pdf',
    codeFile: 'assets/Project2-WebMining.ipynb',
    loaded_file: null
  },

  // ===== PROJECT 3 =====

  {
    title: 'Project 3 – Data Mining',
    image: 'assets/Project3-DataMining.pdf',
    codeFile: 'assets/Project3-DataMining.ipynb',
    loaded_file: null
  },
  {
    title: 'Project 3 – Data Mining Linear Models',
    image: 'assets/Project3-DataMiningLinearM.pdf',
    codeFile: 'assets/Project3-DataMiningLinearM.ipynb',
    loaded_file: null
  },
  {
    title: 'Project 3 – Data Visualization',
    image: null,
    codeFile: 'assets/Project3-DataVisualization.ipynb',
    loaded_file: null
  },
  {
    title: 'Project 3 – Web Mining',
    image: 'assets/Project3-WebMining.pdf',
    codeFile: 'assets/Project3-WebMining.ipynb',
    loaded_file: null
  }

];
  isLoadingDB = false;
  isLoadingDS = false;
  selectedTabIndex = 0;
  openedDsPanels = new Set<number>();
  //api='https://87179ceea058.ngrok-free.app'

  activeNotebook: string | null = null;
  trustedNotebookUrl: SafeResourceUrl | null = null;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadProjectFiles(this.dbProjects);
    this.loadProjectFiles(this.dsProjects);
  }

 /*loadDbProjects(): void {
    this.isLoadingDB = true;
    this.http.get<Project[]>( this.api +'/api/projects/db')
      .subscribe({
        next: (response) => {
          this.dbProjects = response;
          
          this.snackBar.open('Database projects loaded successfully ✅', 'Close', { duration: 2500 });
        },
        error: (err) => {
          console.error('Database projects loading error:', err);
          this.loadDbProjects();
        },
        complete: () => {
          this.isLoadingDB = false;
        }
      });
  }*/

  /*loadDsProjects(): void {
    this.isLoadingDS = true;
    this.http.get<Project[]>( this.api + '/api/project/ds')
      .subscribe({
        next: (response) => {
          this.dsProjects = response;
          this.snackBar.open('Data Science projects loaded successfully ✅', 'Close', { duration: 2500 });
        },
        error: (err) => {
          console.error('Data Science projects loading error:', err);
          this.loadDsProjects();
        },
        complete: () => {
          this.isLoadingDS = false;
        }
      });
  }*/

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
