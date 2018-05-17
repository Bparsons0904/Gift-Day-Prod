import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { PresenterService } from '../../services/presenter.service';
import { Presenter } from '../../models/presenter';
import { Observable } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-presenters-edit',
  templateUrl: './presenters-edit.component.html',
  styleUrls: ['./presenters-edit.component.css']
})
export class PresentersEditComponent implements OnInit {

  id: string;
  presenter: Presenter = {
    name: '',
    occupation: '',
    bio: '',
    education: '',
    email: '',
    currentEmployer: '',
    imageURL: ''
  }

  task: AngularFireUploadTask;
  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURL: Observable<string>;
  isHovering: boolean;
  imageURL: string;

  name: string;

  constructor(
    private presenterService: PresenterService,
    private router: Router,
    private route: ActivatedRoute,
    private flashMessage: FlashMessagesService,
    private storage: AngularFireStorage,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.presenterService.getPresenter(this.id).subscribe(presenter => this.presenter = presenter);
  }

  onSubmit({ value, valid }: { value: Presenter, valid: boolean }) {
    if (!valid) {
      this.flashMessage.show('Please fill out the form correctly.', {
        cssClass: 'alert-danger', timeout: 4000
      });
    } else {
      value.id = this.id;
      this.presenterService.updatePresenter(value);
      this.flashMessage.show('Presenter Updated.', {
        cssClass: 'alert-success', timeout: 4000
      });
      this.router.navigate(['/presenters/'])
      // this.router.navigate(['/presenters/' + this.id])
    }
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(DialogConfirmComponent, {
      disableClose: false,
      data: { name: this.presenter.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onDeleteClick();
      }
      dialogRef = null;
    });
  };

  // onNoClick(): void {
  //   this.dialogRef.close();
  // }

  onDeleteClick() {
    this.presenterService.deletePresenter(this.presenter);
    this.flashMessage.show('Presenter Removed', {
      cssClass: 'alert-success', timeout: 4000
    });
    this.router.navigate(['/presenters']);
    // if (confirm('Are you sure?')) {
    //   this.presenterService.deletePresenter(this.presenter);
    //   this.flashMessage.show('Presenter Removed', {
    //     cssClass: 'alert-success', timeout: 4000
    //   });
    //   this.router.navigate(['/presenters']);
    // }
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
      this.presenter.imageURL = this.imageURL;
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
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.css']
})
export class DialogConfirmComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
