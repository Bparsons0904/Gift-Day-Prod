import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { WorkshopsService } from '../../services/workshops.service';
import { Workshop } from '../../models/Workshops';
import { PresenterService } from '../../services/presenter.service';
import { Presenter } from '../../models/presenter';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs';

import { AngularFirestore } from 'angularfire2/firestore';
import { tap } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-workshops-edit',
  templateUrl: './workshops-edit.component.html',
  styleUrls: ['./workshops-edit.component.css']
})
export class WorkshopsEditComponent implements OnInit {

  id: string;
  workshop: Workshop = {
    name: '',
    // imageURL: 'https://placeimg.com/300/240/tech',
    imageURL: '',
    presenter1: '',
    presenter2: '',
    description: '',
    room: '',
    session1: {
      available: false,
      totalSeats: 0,
      registered: [],
    },
    session2: {
      available: false,
      totalSeats: 0,
      registered: [],
    },
    session3: {
      available: false,
      totalSeats: 0,
      registered: [],
    }
  }

  presenters: Presenter[];
  task: AngularFireUploadTask;
  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURL: Observable<string>;
  isHovering: boolean;
  imageURL: string;

  constructor(
    private wss: WorkshopsService,
    private router: Router,
    private route: ActivatedRoute,
    private flashMessage: FlashMessagesService,
    private presenterService: PresenterService,
    private storage: AngularFireStorage,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.wss.getWorkshop(this.id).subscribe(workshop => this.workshop = workshop);

    this.presenterService.getPresenters().subscribe(presenters => {
      this.presenters = presenters;
    });
  }

  onSubmit({ value, valid }: { value: Workshop, valid: boolean }) {
    if (!valid) {
      this.flashMessage.show('Please fill out the form correctly.', {
        cssClass: 'alert-danger', timeout: 4000
      });
    } else {
      value.id = this.id;
      for (let i = 1; i < 4; i++) {
        if (this.workshop["session" + i].totalSeats > 0) {
          this.workshop["session" + i].available = true;
        } else {
          this.workshop["session" + i].available = false;
        }
      }
      // this.workshop.imageURL = String(this.downloadURL);
      this.wss.updateWorkshop(this.workshop);
      this.flashMessage.show('Workshop Updated.', {
        cssClass: 'alert-success', timeout: 4000
      });
      this.router.navigate(['/workshops/'])
      // this.router.navigate(['/workshops/' + this.id])
    }
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: false,
      data: { name: this.workshop.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onDeleteClick();
      }
      dialogRef = null;
    });
  };

  onDeleteClick() {
    this.wss.deleteWorkshop(this.workshop);
    this.flashMessage.show('Workshop Removed', {
      cssClass: 'alert-success', timeout: 4000
    });
    this.router.navigate(['/workshops']);
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }


  startUpload(event: FileList) {
    // The File object
    const file = event.item(0)

    // Client-side validation example
    if (file.type.split('/')[0] !== 'image') {
      console.error('unsupported file type :( ')
      return;
    }

    // The storage path
    const path = `media/images/workshops/${new Date().getTime()}_${file.name}`;

    // Totally optional metadata
    const customMetadata = { app: 'GIFT Day App' };

    // The main task
    this.task = this.storage.upload(path, file, { customMetadata })

    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges()

    // this.percentage = this.task.percentageChanges();
    // this.snapshot   = this.task.snapshotChanges().pipe(
    //   tap(snap => {
    //     console.log(snap)
    //     if (snap.bytesTransferred === snap.totalBytes) {
    //       this.db.collection('photos').add( { path, size: snap.totalBytes })
    //     }
    //   })
    // )

    // The file's download URL
    // this.downloadURL = this.task.downloadURL();

    this.downloadURL.subscribe(imageURL => {
      // Path for production
      // this.imageURL = path;

      // Path for testing
      this.imageURL = imageURL;
      this.workshop.imageURL = this.imageURL;
      // console.log(this.imageURL);

    });
    // console.log(this.downloadURL);

    // this.workshop.imageURL = String(this.downloadURL);
  }



  // Determines if the upload task is active
  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
  }
}

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}