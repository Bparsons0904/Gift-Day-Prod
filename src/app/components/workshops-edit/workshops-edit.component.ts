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
import { ImageCropperModule } from 'ngx-image-cropper';

import { finalize } from 'rxjs/operators';
import { Ng2ImgMaxService } from 'ng2-img-max';

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
  uploadPercent: Observable<number>;
  myBlob: Blob;
  fileInfo: Observable<any>;
  

  constructor(
    private wss: WorkshopsService,
    private router: Router,
    private route: ActivatedRoute,
    private flashMessage: FlashMessagesService,
    private presenterService: PresenterService,
    private storage: AngularFireStorage,
    private dialog: MatDialog,
    private ng2ImgMax: Ng2ImgMaxService,
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
          this.workshop.imageURL = downloadURL;
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
    let dialogRef = this.dialog.open(WorkshopEditImageComponent, {
      height: '95%',
      width: '95%',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(croppedImage => {
      if (croppedImage) {
        var myBlob: Blob = this.dataURItoBlob(croppedImage);
        let myFile = new File([myBlob], "workshop-image.jpg", { type: 'image/jpeg' });
        // this.ng2ImgMax.resizeImage(myFile, 400, 300).subscribe(
        //   result => {
        //     // this.uploadedImage = result;
        //     myFile = new File([result], "workshop-image.jpg", { type: 'image/jpeg' });
        //   },
        //   error => {
        //     console.log('😢 Oh no!', error);
        //   }
        // );

        this.ng2ImgMax.compressImage(myFile, 0.075).subscribe(
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
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styles: []
})
export class ConfirmComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'app-workshop-edit-image',
  templateUrl: './workshop-edit-image.component.html',
  styles: []
})
export class WorkshopEditImageComponent {

  aspect: string = " 4 / 3"

  constructor(
    public dialogRef: MatDialogRef<WorkshopEditImageComponent>,
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