import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  AngularFirestore, AngularFirestoreCollection,
  AngularFirestoreDocument
} from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { Workshop } from '../models/workshops';

@Injectable({
  providedIn: 'root'
})
export class WorkshopsService {

  workshopsCollection: AngularFirestoreCollection<Workshop>;
  workshopDoc: AngularFirestoreDocument<Workshop>;
  workshops: Observable<Workshop[]>;
  workshop: Observable<Workshop>;

  constructor(
    private afs: AngularFirestore
  ) {
    this.workshopsCollection = this.afs.collection('workshops',
      ref => ref.orderBy('room', 'desc'));
   }

  getWorkshops(): Observable<Workshop[]> {
    this.workshops = this.workshopsCollection.snapshotChanges().pipe(
      map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as Workshop;
          data.id = action.payload.doc.id;
          return data;
        });
      }));

    return this.workshops;
  }

  newWorkshop(client: Workshop) {
    this.workshopsCollection.add(client);
  }

  getWorkshop(id: string): Observable<Workshop> {
    this.workshopDoc = this.afs.doc<Workshop>(`workshops/${id}`);
    this.workshop = this.workshopDoc.snapshotChanges().pipe(map(action => {
      if (action.payload.exists === false) {
        return null;
      } else {
        const data = action.payload.data() as Workshop;
        data.id = action.payload.id;
        return data;
      }
    }));
    return this.workshop;
  }

  updateWorkshop(workshop: Workshop) {
    this.workshopDoc = this.afs.doc(`workshops/${workshop.id}`);
    this.workshopDoc.update(workshop);
  }

  deleteWorkshop(workshop: Workshop) {
    this.workshopDoc = this.afs.doc(`workshops/${workshop.id}`);
    this.workshopDoc.delete();
  }
}
