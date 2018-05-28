import { of as observableOf, Observable } from 'rxjs';

import { map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';

  //User Profile Addin
import { Router } from '@angular/router';
import {
  AngularFirestore, AngularFirestoreCollection,
  AngularFirestoreDocument
} from 'angularfire2/firestore';
  // import { firebase } from '@firebase/app';
import * as firebaseaf from 'firebase/app';
import { firebase } from '@firebase/app';
import '@firebase/auth';

import { FlashMessagesService } from 'angular2-flash-messages';
import { NotifyService } from './notify.service';

import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: Observable<User>;
  uid: string;
  test: string;
  authState; any = null;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private flashMessage: FlashMessagesService,
    private notify: NotifyService,
  ) {
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return observableOf(null);
        }
      }));

    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth;
    });
   }

  // login() {
  //   this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  // }

  getAuth() {
    return this.afAuth.authState.pipe(map(auth => auth));
  }

  getAuthID() {
    return this.authState.uid;
    // return this.afAuth.auth;
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  // User Profile Addins
  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }

  facebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.oAuthLogin(provider);
  }

  phoneLogin() {
    const provider = new firebase.auth.PhoneAuthProvider();
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider: firebaseaf.auth.AuthProvider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        this.notify.update('Welcome to Firestarter!!!', 'success');
        return this.updateUserData(credential.user);
      })
      .catch((error) => this.handleError(error));
  }


  emailSignUp(email: string, password: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((user) => {
        const subUser = user.user;
        // this.notify.update('Welcome to Firestarter!!!', 'success');
        return this.updateUserData(subUser); // if using firestore
      })
      .catch(err => {
        this.flashMessage.show(err.message, {
          cssClass: 'alert-danger', timeout: 4000
        });
      });
    // .catch((error) => this.handleError(error));
  }

  emailLogin(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((user) => {
        const subUser = user.user;
        return this.updateUserData(subUser);
        // this.notify.update('Welcome to Firestarter!!!', 'success')
        // console.log(user);
        // this.setId(user.user.uid);
     //   return this.updateUserData(user); // if using firestore
      })
      .catch(err => {
        this.flashMessage.show(err.message, {
          cssClass: 'alert-danger', timeout: 4000
        });
      });
    // .catch((error) => this.handleError(error));
  }

  // Sends email allowing user to reset password
  resetPassword(email: string) {
    const fbAuth = firebase.auth();

    return fbAuth.sendPasswordResetEmail(email)
      .then(() => this.notify.update('Password update email sent', 'info'))
      .catch((error) => this.handleError(error));
  }

  signOut() {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  // If error, console log and notify user
  private handleError(error: Error) {
    console.error(error);
    this.notify.update(error.message, 'error');
  }

  setId(uid: string) {
    this.uid = uid;
  }

  getId() {
    return this.uid;
  }
  // Sets user data to firestore after succesful login
  private updateUserData(user: User) {

    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

    this.setId(user.uid);

    if (user.displayName != null) {
      const data: User = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName,
        workshops: [null, null, null],
      };
      return userRef.set(data, { merge: true });
    } else {
      const data: User = {
        uid: user.uid,
        email: user.email || null,
        workshops: [null, null, null],
      };
      return userRef.set(data, { merge: true });
    }
  }
}
