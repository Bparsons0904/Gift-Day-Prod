import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { PresenterService } from '../../services/presenter.service';
import { Presenter } from '../../models/presenter';
import { Observable } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';
// import { tap } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs/operators';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { Ng2ImgMaxService } from 'ng2-img-max';

@Component({
  selector: 'app-presenters-add',
  templateUrl: './presenters-add.component.html',
  styleUrls: ['./presenters-add.component.css']
})
export class PresentersAddComponent implements OnInit {

  presenter: Presenter = {
    name: '',
    occupation: '',
    bio: '',
    education: '',
    email: '',
    currentEmployer: '',
    imageURL: '',
    // imageURL: 'https://placeimg.com/300/240/people'
  }

  task: AngularFireUploadTask;
  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURL: Observable<string>;
  isHovering: boolean;
  imageURL: string;
  uploadPercent: Observable<number>;
  myBlob: Blob;
  fileInfo: Observable<any>;

  @ViewChild('presenterForm') form: any;

  constructor(
    private presenterService: PresenterService,
    private flashMessage: FlashMessagesService,
    private router: Router,
    private storage: AngularFireStorage,
    private dialog: MatDialog,
    private ng2ImgMax: Ng2ImgMaxService,
  ) { }

  ngOnInit() {
  }

  onSubmit({ value, valid }: { value: Presenter, valid: boolean }) {
    if (!valid) {
      this.flashMessage.show('Please fill out the form correctly', {
        cssClass: 'alert-danger', timeout: 4000
      });
    } else {
      // this.downloadURL.subscribe(downloadURL => {
      //   value.imageURL = downloadURL;
        
      // })
      this.presenterService.newPresenter(value);
      this.flashMessage.show('New presenter added', {
        cssClass: 'alert-success', timeout: 4000
      });
      this.router.navigate(['/presenters']);
    }
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  uploadFile(event) {
    const file = event;
    // const file = event.target.files[0];
    // console.log(file);

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
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(PresentersAddImageComponent, {
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
  selector: 'app-presenters-add-image',
  templateUrl: './presenters-add-image.component.html',
  styles: []
})
export class PresentersAddImageComponent {

  aspect: string = " 4 / 3"

  constructor(
    public dialogRef: MatDialogRef<PresentersAddImageComponent>,
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