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
import { finalize } from 'rxjs/operators';
import { ImageCropperModule } from 'ngx-image-cropper';
import { Ng2ImgMaxService } from 'ng2-img-max';

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
  uploadPercent: Observable<number>;
  name: string;
  myBlob: Blob;
  fileInfo: Observable<any>;

  constructor(
    private presenterService: PresenterService,
    private router: Router,
    private route: ActivatedRoute,
    private flashMessage: FlashMessagesService,
    private storage: AngularFireStorage,
    private dialog: MatDialog,
    private ng2ImgMax: Ng2ImgMaxService,
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

  uploadFile(event) {
    const file = event;
    const filePath = `media/images/workshops/${new Date().getTime()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    if (file.type.split('/')[0] !== 'image') {
      console.error('unsupported file type :( ')
      return;
    }

    this.uploadPercent = task.percentageChanges();

    task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();
        this.downloadURL.subscribe(downloadURL => {
          this.presenter.imageURL = downloadURL;
        });
      })
    )
      .subscribe();
  }

  dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: 'image/jpg'
    });
  }

  blobToFile = (theBlob: Blob, fileName: string): File => {
    var b: any = theBlob;
    b.lastModifiedDate = new Date();
    b.name = fileName;

    return <File>theBlob;
  }

  openDialogUpload(): void {
    let dialogRef = this.dialog.open(PresentersEditImageComponent, {
      height: '95%',
      width: '95%',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(croppedImage => {
      if (croppedImage) {
        var myBlob: Blob = this.dataURItoBlob(croppedImage);
        let myFile = new File([myBlob], "workshop-image.jpg", { type: 'image/jpeg' });
        this.ng2ImgMax.compressImage(myFile, 0.250).subscribe(
          result => {
            myFile = new File([result], "workshop-image.jpg", { type: 'image/jpeg' });
            this.uploadFile(myFile);
          },
          error => {
            console.log('😢 Oh no!', error);
          }
        );
      }
      dialogRef = null;
    });
  };

}

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styles: []
})
export class DialogConfirmComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'app-presenters-edit-image',
  templateUrl: './presenters-edit-image.component.html',
  styles: []
})
export class PresentersEditImageComponent {

  aspect: string = " 4 / 3"

  constructor(
    public dialogRef: MatDialogRef<PresentersEditImageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  imageChangedEvent: any = '';
  croppedImage: any = '';
  imageRotation: number = 0;
  imageFinishedLoading: boolean;

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(image: string) {
    this.croppedImage = image;
  }
  imageLoaded() {
    // show cropper
    this.imageFinishedLoading = true;
  }
  loadImageFailed() {
    // show message
  }

}