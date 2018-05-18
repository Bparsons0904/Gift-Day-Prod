import { take } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { WorkshopsService } from '../../services/workshops.service';
import { Workshop } from '../../models/Workshops';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-workshops-home',
  templateUrl: './workshops-home.component.html',
  styleUrls: ['./workshops-home.component.css']
})
export class WorkshopsHomeComponent implements OnInit {

  workshops: Workshop[];
  workshop: Workshop;
  admin: boolean;

  constructor(
    private wss: WorkshopsService,
    private icon: MatIconModule,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private auth: AuthService,
    private userService: UserService,
  ) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/mdi.svg'));

   }

  ngOnInit() {
    this.wss.getWorkshops().subscribe(workshops => {
      this.workshops = workshops;
    });
    this.auth.user.pipe(take(1)).subscribe(user => {
      if (user != null) {
        this.admin = user.admin;
        if (this.admin) {
          this.userService.setAdmin();
        }
      }
    });
  }
}
