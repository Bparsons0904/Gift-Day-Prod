import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { WorkshopsService } from '../../services/workshops.service';
import { Workshop } from '../../models/Workshops';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/User';
import { Observable } from '@firebase/util';
import { Presenter } from '../../models/Presenter';
import { PresenterService } from '../../services/presenter.service';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatChipsModule } from '@angular/material/chips';

import { MqIfDirective } from '../../directives/mq-if.directive';


@Component({
  selector: 'app-workshop-details',
  templateUrl: './workshop-details.component.html',
  styleUrls: ['./workshop-details.component.css']
})
export class WorkshopDetailsComponent implements OnInit {

  id: string;
  workshop: Workshop;
  uid: string;
  registered: boolean;
  registered1: boolean;
  registered2: boolean;
  registered3: boolean;
  currentRegistration: number;
  registeredSession: string;
  userRegisteredPosition: number;
  user: User;
  presenter1: Presenter;
  presenter2: Presenter;
  step = 0;

  constructor(
    private wss: WorkshopsService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private auth: AuthService,
    private presenterService: PresenterService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/mdi.svg'));
   }

  ngOnInit() {
    // this.uid = this.auth.getAuthID();
    this.id = this.route.snapshot.params['id'];
    this.wss.getWorkshop(this.id).subscribe(workshop => {
      this.workshop = workshop;

      this.auth.user.subscribe(user => {
        if (user != null) {
          this.uid = user.uid;
          this.userService.getUser(this.uid).subscribe(user => {
            this.user = user;
            for (let i = 0; i < this.user.workshops.length; i++) {
              const element = this.user.workshops[i];
              if (element != null) {
                this["registered" + (i + 1)] = true;
              }
              if (element == this.id) {
                this.currentRegistration = i + 1;
              }
            }
          });
          if (this.workshop.session1.registered.indexOf(this.uid) > -1) {
            this.registered1 = true;
            this.registered = true;
            this.registeredSession = '1';
          } else {
            this.registered1 = false;
          };

          if (this.workshop.session2.registered.indexOf(this.uid) > -1) {
            this.registered2 = true;
            this.registered = true;
            this.registeredSession = '2';
          } else {
            this.registered2 = false;
          };
          if (this.workshop.session3.registered.indexOf(this.uid) > -1) {
            this.registered3 = true;
            this.registered = true;
            this.registeredSession = '3';
          } else {
            this.registered3 = false;
          };
        } else {
          this.uid = null;
        }
      });

      this.presenterService.getPresenter(this.workshop.presenter1).subscribe(presenter => this.presenter1 = presenter);
      if (this.workshop.presenter2) {
        this.presenterService.getPresenter(this.workshop.presenter2).subscribe(presenter => this.presenter2 = presenter);
      }
    });
  }

  workshopRegister(sessionNumber) {
    this.workshop['session' + sessionNumber].registered.push(this.uid);
    this.wss.updateWorkshop(this.workshop);
    this['registered' + sessionNumber] = true;
    this.registeredSession = sessionNumber;
    this.registered = true;
    this["registered" + (sessionNumber + 1)] = true;
    this.user.workshops.splice((Number(sessionNumber) - 1), 1, this.id);
    this.userService.addUserRegistration(this.user);
  }

  deleteRegistration() {
    this.workshop['session' + this.registeredSession].registered.splice(this.workshop['session' + this.registeredSession].registered.indexOf(this.uid), 1)
    this.registered = false;
    this.registeredSession = null;
    this.registered1 = false;
    this.wss.updateWorkshop(this.workshop);
    this.user.workshops.splice(this.user.workshops.indexOf(this.id), 1, null);
    this.userService.removeUserRegistration(this.user);
    this.currentRegistration = null;
  }
}
