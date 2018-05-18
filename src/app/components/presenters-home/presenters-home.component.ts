import { take } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { PresenterService } from '../../services/presenter.service';
import { Presenter } from '../../models/presenter';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';

import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-presenters-home',
  templateUrl: './presenters-home.component.html',
  styleUrls: ['./presenters-home.component.css']
})
export class PresentersHomeComponent implements OnInit {

  presenters: Presenter[];
  admin: boolean;

  constructor(
    private presenterService: PresenterService,
    private icon: MatIconModule,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private auth: AuthService,
    private userService: UserService,
  ) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/mdi.svg'));

   }

  ngOnInit() {
    this.presenterService.getPresenters().subscribe(presenters => {
      this.presenters = presenters;
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
