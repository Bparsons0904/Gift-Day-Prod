import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  AngularFirestore, AngularFirestoreCollection,
  AngularFirestoreDocument
} from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  usersCollection: AngularFirestoreCollection<User>;
  userDoc: AngularFirestoreDocument<User>;
  users: Observable<User[]>;
  user: Observable<User>;
  completeProfile: boolean = false;
  admin: boolean = false;

  constructor(
    private afs: AngularFirestore
  ) { 
    this.usersCollection = this.afs.collection('users',
      ref => ref.orderBy('lastName', 'asc'));
  }

  getUser(id: string): Observable<User> {
    this.userDoc = this.afs.doc<User>(`users/${id}`);
    this.user = this.userDoc.snapshotChanges().pipe(map(action => {
      if (action.payload.exists === false) {
        return null;
      } else {
        const data = action.payload.data() as User;
        data.id = action.payload.id;
        return data;
      }
    }));

    return this.user;
  }

  updateUsers(user: User) {
    this.userDoc = this.afs.doc(`users/${user.uid}`);
    this.userDoc.update(user);
  }

  addUserRegistration(user: User) {
    this.userDoc = this.afs.doc(`users/${user.uid}`);
    this.userDoc.update(user);
  }

  removeUserRegistration(user: User) {
    this.userDoc = this.afs.doc(`users/${user.uid}`);
    this.userDoc.update(user);
  }

  setAdmin() {
    this.admin = true;
  }

  getAdmin() {
    return this.admin;
  }
}
