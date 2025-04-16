import {Component } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { ContactDialogComponent } from '../contact/contact-dialog';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls:[ './home.component.scss']
})
export class HomeComponent {
    constructor(private dialog: MatDialog) {}
  
    openContactDialog(): void {
      this.dialog.open(ContactDialogComponent, {
        width: '600px',
        autoFocus: false
      });
    }
}
