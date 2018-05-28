import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { environment } from '../environments/environment';
import {
  AngularFireModule, FirebaseOptionsToken,
  FirebaseAppNameToken,
  FirebaseAppConfigToken } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireStorageModule } from 'angularfire2/storage';

// import { firebase } from '@firebase/app';
import * as firebase from 'firebase';
// firebase.initializeApp(environment.firebase);
// firebase.firestore().settings({ timestampsInSnapshots: true })

import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { WorkshopsService } from './services/workshops.service';
import { PresenterService } from './services/presenter.service';

import { NotifyService } from './services/notify.service';

import { FlashMessagesModule } from 'angular2-flash-messages';
import { MqIfDirective } from './directives/mq-if.directive';

import { HomeComponent } from './components/home/home.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { WorkshopsHomeComponent } from './components/workshops-home/workshops-home.component';
import { WorkshopsEditComponent, ConfirmComponent, WorkshopEditImageComponent } from './components/workshops-edit/workshops-edit.component';
import { WorkshopsAddComponent, WorkshopAddImageComponent } from './components/workshops-add/workshops-add.component';
import { WorkshopDetailsComponent } from './components/workshop-details/workshop-details.component';
import { PresentersDetailsComponent } from './components/presenters-details/presenters-details.component';
import { PresentersAddComponent, PresentersAddImageComponent } from './components/presenters-add/presenters-add.component';
import { PresentersEditComponent, DialogConfirmComponent, PresentersEditImageComponent } from './components/presenters-edit/presenters-edit.component';
import { PresentersHomeComponent } from './components/presenters-home/presenters-home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

// Material Angular
import { MatButtonModule, MatCheckboxModule, MatCardModule } from '@angular/material';
import { MatIconRegistry, MatIconModule, MatChipsModule } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Cropping Tools
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageCropperComponent } from 'ngx-img-cropper';

@NgModule({
  declarations: [
    AppComponent,
    WorkshopsHomeComponent,
    HomeComponent,
    NavBarComponent,
    LoginComponent,
    ProfileComponent,
    WorkshopsEditComponent,
    WorkshopsAddComponent,
    PresentersAddComponent,
    PresentersEditComponent,
    PresentersHomeComponent,
    NotFoundComponent,
    MqIfDirective,
    DialogConfirmComponent,
    ConfirmComponent,
    WorkshopDetailsComponent,
    PresentersDetailsComponent,
    WorkshopAddImageComponent,
    WorkshopEditImageComponent,
    PresentersEditImageComponent,
    PresentersAddImageComponent,
    ImageCropperComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlashMessagesModule.forRoot(),
    AngularFireModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireStorageModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    BrowserAnimationsModule,
    HttpClientModule,
    Ng2ImgMaxModule,
    ImageCropperModule,
    MatProgressBarModule,
  ],
  entryComponents: [
    DialogConfirmComponent, ConfirmComponent, WorkshopAddImageComponent, WorkshopEditImageComponent, PresentersEditImageComponent, PresentersAddImageComponent
  ],
  providers: [{ provide: FirebaseOptionsToken, useValue: environment.firebase }, AuthService, UserService, WorkshopsService, PresenterService, NotifyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
