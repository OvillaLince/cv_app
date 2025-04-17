import { SafeHtml } from '@angular/platform-browser';

export interface CodeFile {
  name: string;
  content: SafeHtml;
}

export interface Project {
  title: string;
  image: string | null;
  code_files: string[];
  loaded_files: CodeFile[];
}
