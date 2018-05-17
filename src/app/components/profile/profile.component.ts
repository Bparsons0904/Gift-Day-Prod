import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import {
  AngularFirestore, AngularFirestoreCollection,
  AngularFirestoreDocument
} from 'angularfire2/firestore';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { WorkshopsService } from '../../services/workshops.service';
import { Workshop } from '../../models/Workshops';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DomSanitizer } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  id: string;
  user: User;
  // client: Client;
  userID: string;
  workshops: Workshop[];
  registeredWorkshop: any[];
  test: Observable<User>;
  uid: string;
  completeProfile: boolean = false;

  workshop1: Workshop;
  workshop2: Workshop;
  workshop3: Workshop;

  workshop: Workshop;

  grades = [
    { value: 'Freshman', viewValue: 'Freshman' },
    { value: 'Sophmore', viewValue: 'Sophomore' },
    { value: 'Junior', viewValue: 'Junior' },
    { value: 'Senior', viewValue: 'Senior' }
  ];

  constructor(
    public auth: AuthService,
    private flashMessage: FlashMessagesService,
    // private afs: AngularFirestore,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private wss: WorkshopsService,

    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) { 
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/mdi.svg'));

  }

  ngOnInit() {
    this.auth.user.subscribe(user => {
      if (user != null) {
        this.uid = user.uid;
        this.userService.getUser(this.uid).subscribe(user => {
          this.user = user;
          if (user.email && user.displayName && user.grade) {
            this.completeProfile = true;
          }
          if (user.workshops.length != 3) {
            this.user.workshops = [null, null, null];
            this.userService.updateUsers(this.user);
          }
          for (let i = 0; i < 3; i++) {
            if (user.workshops[i] != null) {
              this.wss.getWorkshop(user.workshops[i]).subscribe(workshop => {
                this["workshop" + String(i + 1)] = workshop;
              });
            } else {
              this["workshop" + String(i + 1)] = undefined;
            }
          };
        });
      }

    });
  }

  onSubmit({ value, valid }: { value: User, valid: boolean }) {
    if (!valid) {
      this.flashMessage.show('Please fill out the form correctly.', {
        cssClass: 'alert-danger', timeout: 4000
      });
    } else {
      if (value.workshops == null) {
        value.workshops = [];
      }
      value.uid = this.user.uid;
      this.userService.updateUsers(value);
      this.flashMessage.show('User Profile Updated.', {
        cssClass: 'alert-success', timeout: 4000
      });
      if (this.user.email && this.user.displayName && this.user.grade) {
        this.completeProfile = true;
      }
      // this.router.navigate(['/'])
    }
  }

  deleteRegistration(registeredSession, id) {
    this['workshop' + registeredSession]['session' + registeredSession].registered.splice(this['workshop' + registeredSession]['session' + registeredSession].registered.indexOf(this.uid), 1)
    // this.workshop['session' + this.registeredSession].availableSeats += 1;
    this.wss.updateWorkshop(this["workshop" + registeredSession]);
    this.user.workshops.splice(this.user.workshops.indexOf(id), 1, null);
    this.userService.removeUserRegistration(this.user);
    this['workshop' + registeredSession] = undefined;
    // console.log(this.workshop['session' + this.registeredSession].registered, this.user.workshops, this.registered);
  }

  editProfile() {
    this.completeProfile = !this.completeProfile;
  }

  idcheck() {
    this.test = this.auth.getAuthID();
    console.log(this.auth.getAuthID());

  }
}
