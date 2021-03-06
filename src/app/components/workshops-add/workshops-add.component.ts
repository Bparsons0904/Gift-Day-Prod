import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs/operators';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { ImageCropperModule } from 'ngx-image-cropper';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { ImageCropperComponent, CropperSettings, Bounds } from 'ngx-img-cropper';

@Component({
  selector: 'app-workshops-add',
  templateUrl: './workshops-add.component.html',
  styleUrls: ['./workshops-add.component.css']
})
export class WorkshopsAddComponent implements OnInit {

  workshop: Workshop = {
    name: '',
    imageURL: '',
    // imageURL: 'https://placeimg.com/300/240/tech',
    presenter1: '',
    presenter2: '',
    description: '',
    room: '',
    session1: {
      available: false,
      totalSeats: 0,
      // availableSeats: 0,
      registered: [],
    },
    session2: {
      available: false,
      totalSeats: 0,
      // availableSeats: 0,
      registered: [],
    },
    session3: {
      available: false,
      totalSeats: 0,
      // availableSeats: 0,
      registered: [],
    }
  };

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
  croppedImage: any;
  name: string;
  data1: any;
  cropperSettings1: CropperSettings;
  croppedWidth: number;
  croppedHeight: number;

  swapImage: boolean;
  uploadCompleted = true;
  processing: boolean;
  compressedFile: any;

  @ViewChild('workshopForm') form: any;

  constructor(
    private flashMessage: FlashMessagesService,
    private wss: WorkshopsService,
    private router: Router,
    private presenterService: PresenterService,
    private storage: AngularFireStorage,
    private dialog: MatDialog,
    private ng2ImgMax: Ng2ImgMaxService,
  ) {
    this.name = 'Angular2';
    this.cropperSettings1 = new CropperSettings();
    this.cropperSettings1.width = 200;
    this.cropperSettings1.height = 150;

    this.cropperSettings1.croppedWidth = 800;
    this.cropperSettings1.croppedHeight = 600;

    // Canvas Size for DOM
    this.cropperSettings1.canvasWidth = 275;
    this.cropperSettings1.canvasHeight = 300;

    this.cropperSettings1.minWidth = 10;
    this.cropperSettings1.minHeight = 10;
    // this.cropperSettings1.compressRatio = 2;

    // this.cropperSettings1.dynamicSizing = true;
    this.cropperSettings1.keepAspect = true;
    this.cropperSettings1.preserveSize = false;

    this.cropperSettings1.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
    this.cropperSettings1.cropperDrawSettings.strokeWidth = 2;
    this.cropperSettings1.cropperClass = 'cropper-tool';

    this.data1 = {};
  }

  ngOnInit() {
    this.presenterService.getPresenters().subscribe(presenters => {
      this.presenters = presenters;
    });
    const width = document.getElementsByClassName('card-body')['0'].offsetWidth;
    this.cropperSettings1.canvasWidth = width - 40;
    this.cropperSettings1.canvasHeight = width;
  }

  imageSwap() {
    this.swapImage = !this.swapImage;
  }

  cropped(bounds: Bounds) {
    this.croppedHeight = bounds.bottom - bounds.top;
    this.croppedWidth = bounds.right - bounds.left;
  }

  finishedImageToFile(image) {
    const myBlob: Blob = this.dataURItoBlob(image.src);
    const myFile = new File([myBlob], 'workshop-image.jpg', { type: 'image/jpeg' });
    return myFile;
  }

  compressImage(myFile, compression) {
    return new Promise((resolve, reject) => {
      this.ng2ImgMax.compressImage(myFile, compression).subscribe(
        result => {
          this.compressedFile = new File([result], 'workshop-image.jpg', { type: 'image/jpeg' }),
            error => {
              if (error) {
                console.log('error');
              }
            }
            ,
            this.imageSwap();
          this.uploadFile(this.compressedFile);
        },
        error => {
          console.log('😢 Oh no!', error);
        }
      );
    });
  }

  imageSelect() {
    this.processing = true;
    const image = document.getElementById('cropped-result');
    const myFile: File = this.finishedImageToFile(image);
    if (myFile.size > 5000000) {
      this.compressImage(myFile, 0.250);
    } else if (myFile.size > 3000000) {
      this.compressImage(myFile, 0.125);
    } else {
      this.compressImage(myFile, 0.075);
    }
  }

  uploadComplete() {
    this.uploadCompleted = true;
    this.processing = false;
  }

  onSubmit({ value, valid }: { value: Workshop, valid: boolean }) {
    if (!valid) {
      this.flashMessage.show('Please fill out the form correctly', {
        cssClass: 'alert-danger', timeout: 4000
      });
    } else {
      if (this.workshop.session1.totalSeats > 0) {
        this.workshop.session1.available = true;
        // this.workshop.session1.availableSeats = this.workshop.session1.totalSeats;
      }
      if (this.workshop.session2.totalSeats > 0) {
        this.workshop.session2.available = true;
        // this.workshop.session2.availableSeats = this.workshop.session2.totalSeats;
      }
      if (this.workshop.session3.totalSeats > 0) {
        this.workshop.session3.available = true;
        // this.workshop.session3.availableSeats = this.workshop.session3.totalSeats;
      }
      this.wss.newWorkshop(this.workshop);
      this.flashMessage.show('New workshop added', {
        cssClass: 'alert-success', timeout: 4000
      });
      this.router.navigate(['/workshops']);
    }
  }

  uploadFile(event) {
    this.uploadCompleted = false;
    const file = event;
    const filePath = `media/images/workshops/${new Date().getTime()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    if (file.type.split('/')[0] !== 'image') {
      console.error('unsupported file type :( ');
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
      .subscribe(null, null, () => this.uploadComplete());
  }

  dataURItoBlob(dataURI) {
    const binary = atob(dataURI.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: 'image/jpg'
    });
  }
}
