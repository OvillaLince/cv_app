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
      code_file: 'assets/Project1-DataVisualization.ipynb',
      loaded_file: null
    },
    {
      title: 'Linear Models Project',
      image: null,
      code_file: 'assets/Project1-DataMiningLinearM.ipynb',
      loaded_file: null
    },
    {
      title: 'WebMining',
      image: null,
      code_file: 'assets/Project2-WebMining.ipynb',
      loaded_file: null
    }
  ];

  dsProjects: Project[] = [
    {
      title: 'Linear Models Project',
      image: null,
      code_file: 'assets/Project1-DataMiningLinearM.ipynb',
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

      if (path.endsWith('.sql') || path.endsWith('.txt')) {
        this.http.get(path, { responseType: 'text' }).subscribe({
          next: content => {
            project.loaded_file = {
              name: this.getFilename(path),
              content: this.sanitizer.bypassSecurityTrustHtml(`<pre class="plain-code">${this.escapeHtml(content)}</pre>`)
            };
          },
          error: err => console.error(`Failed to load ${path}:`, err)
        });
      }

      else if (path.endsWith('.ipynb')) {
        this.http.get<any>(path).subscribe({
          next: json => {
            const html = this.extractNotebookHTML(json);
            project.loaded_file = {
              name: this.getFilename(path),
              content: html
            };
          },
          error: err => console.error(`Failed to load notebook ${path}:`, err)
        });
      }
    }
  }

  extractNotebookHTML(json: any): SafeHtml {
    const cells = json.cells || [];
    let html = '';
  
    for (const cell of cells) {
      // ✅ CODE CELLS
      if (cell.cell_type === 'code') {
        const codeRaw = cell.source.join('');
        html += `<div class="code-cell"><pre class="code">${this.escapeHtml(codeRaw)}</pre>`;
  
        if (cell.outputs?.length) {
          html += `<div class="outputs">`;
  
          for (const output of cell.outputs) {
            // ✅ print() / console output
            if (output.output_type === 'stream' && output.text) {
              const text = Array.isArray(output.text) ? output.text.join('') : output.text;
              if (text && text.trim()) {
                html += `<div class="output-text">${this.escapeHtml(text)}</div>`;
              }
            }
  
            // ✅ return value from last line
            if (output.output_type === 'execute_result' && output.data?.['text/plain']) {
              const plainText = output.data['text/plain'];
              if (this.looksLikeDataFrame(plainText)) {
                html += this.renderTextTableAsHtml(plainText);
              } else {
                html += `<div class="output-text">${this.escapeHtml(plainText)}</div>`;
              }
            }
  
            // ✅ images
            if (output.data?.['image/png']) {
              html += `<img class="output-image" src="data:image/png;base64,${output.data['image/png']}" />`;
            }
  
            // ✅ errors
            if (output.output_type === 'error' && output.traceback?.length) {
              const traceback = output.traceback.join('\n');
              html += `<div class="output-error">${this.escapeHtml(traceback)}</div>`;
            }
          }
  
          html += `</div>`; // end .outputs
        }
  
        html += `</div><hr>`; // end .code-cell
      }
  
      // ✅ MARKDOWN CELLS
      else if (cell.cell_type === 'markdown') {
        const markdownText = cell.source.join('');
        html += `<div class="markdown-cell">${this.escapeHtml(markdownText)}</div>`;
      }
    }
  
    return this.sanitizer.bypassSecurityTrustHtml(html);
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
