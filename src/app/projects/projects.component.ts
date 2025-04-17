import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

interface CodeFile {
  name: string;
  content: SafeHtml;
}

interface Project {
  title: string;
  image: string | null;
  code_file: string;
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
      title: 'Data Visualization',
      image: null,
      code_file: 'Project1-DataVisualization.ipynb',
      loaded_file: null
    },
    {
      title: 'Linear Models Project',
      image: null,
      code_file: 'Project1-DataMiningLinearM.ipynb',
      loaded_file: null
    },
    {
      title: 'WebMining',
      image: null,
      code_file: 'Project2-WebMining.ipynb',
      loaded_file: null
    }
  ];

  dsProjects: Project[] = [
    {
      title: 'Linear Models Project',
      image: null,
      code_file: 'Project1-DataMiningLinearM.ipynb',
      loaded_file: null
    },
   
  ];

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadProjectFiles(this.dbProjects);
    this.loadProjectFiles(this.dsProjects);
  }

  loadProjectFiles(projects: Project[]) {
    for (const project of projects) {
      const path = project.code_file;
  
      // ✅ Use nbviewer for hosted notebooks on GitHub
      if (path.endsWith('.ipynb')) {
        const full_path = 'https://raw.githubusercontent.com/OvillaLince/cv_app/main/src/app/notebooks/' + path;
        console.log(full_path);
        const iframeHTML = `
          <iframe
            src="https://nbviewer.jupyter.org/url/${encodeURIComponent(full_path)}"
            width="100%"
            height="800"
            frameborder="0"
          ></iframe>
        `;
        project.loaded_file = {
          name: this.getFilename(path),
          content: this.sanitizer.bypassSecurityTrustHtml(iframeHTML)
        };
      }
  
      // ✅ Load local SQL or text files
      else if (path.endsWith('.sql') || path.endsWith('.txt')) {
        this.http.get(path, { responseType: 'text' }).subscribe({
          next: content => {
            project.loaded_file = {
              name: this.getFilename(path),
              content: this.sanitizer.bypassSecurityTrustHtml(`<pre class="plain-code">${this.escapeHtml(content)}</pre>`)
            };
          },
          error: err => console.error(`Error loading ${path}`, err)
        });
      }
  
    }
  }
  

  extractNotebookHTML(json: any): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`<pre>${this.escapeHtml(JSON.stringify(json, null, 2))}</pre>`);
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
  
  looksLikeDataFrame(text: string): boolean {
    const lines = text.split('\n');
    return (
      lines.length > 1 &&
      lines[0].match(/^\s*\w+/) !== null &&
      lines[1].match(/^\s*\d+/) !== null
    );
  }
  
  renderTextTableAsHtml(text: string): string {
    const rows = text.trim().split('\n');
    const tableRows = rows.map((line, i) => {
      const cols = line.trim().split(/\s{2,}|\t/);
      const tag = i === 0 ? 'th' : 'td';
      return `<tr>${cols.map(c => `<${tag}>${this.escapeHtml(c)}</${tag}>`).join('')}</tr>`;
    });
  
    return `<div class="output-table"><table>${tableRows.join('')}</table></div>`;
  }
  

  getFilename(path: string): string {
    return path.split('/').pop() || '';
  }
}
