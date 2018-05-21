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

  @ViewChild('workshopForm') form: any;

  constructor(
    private flashMessage: FlashMessagesService,
    private wss: WorkshopsService,
    private router: Router,
    private presenterService: PresenterService,
    private storage: AngularFireStorage,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.presenterService.getPresenters().subscribe(presenters => {
      this.presenters = presenters;
    });
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
      };
      if (this.workshop.session2.totalSeats > 0) {
        this.workshop.session2.available = true;
        // this.workshop.session2.availableSeats = this.workshop.session2.totalSeats;
      };
      if (this.workshop.session3.totalSeats > 0) {
        this.workshop.session3.available = true;
        // this.workshop.session3.availableSeats = this.workshop.session3.totalSeats;
      };
      this.wss.newWorkshop(this.workshop);
      this.flashMessage.show('New workshop added', {
        cssClass: 'alert-success', timeout: 4000
      });
      this.router.navigate(['/workshops']);
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
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  }

  setFileName(test1, test2) {
    console.log(test1, test2);

  }

  openDialog(): void {
    let dialogRef = this.dialog.open(WorkshopAddImageComponent, {
      height: '95%',
      width: '95%',
      disableClose: false,
      // data: { fileInfo: this.fileInfo }
    });

    // dialogRef.afterClosed().subscribe(croppedImage => {
    //   if (croppedImage) {
    //     this.myBlob = this.dataURItoBlob(croppedImage);
    //     let myFile = new File([this.myBlob], "workshop-image.jpg", { type: 'image/jpeg' });
        
    //   }

    // }, imageChangeEvent => {
    //   console.log("image change started");
      
    //     var fileName = imageChangeEvent.target.files[0].name;
    //     let myFile = new File([this.myBlob], fileName, { type: 'image/jpeg' });
    //     this.uploadFile(myFile);
    //     dialogRef = null;
    //   }
    // )};

    dialogRef.afterClosed().subscribe(croppedImage => {
      if (croppedImage) {
        var myBlob: Blob = this.dataURItoBlob(croppedImage);
        let myFile = new File([myBlob], "workshop-image.jpg", { type: 'image/jpeg' });
        this.uploadFile(myFile);
      }
      dialogRef = null;
    });
  };
}

@Component({
  selector: 'app-workshop-add-image',
  templateUrl: './workshop-add-image.component.html',
  styleUrls: ['./workshop-add-image.component.css']
})
export class WorkshopAddImageComponent {

  aspect: string = " 4 / 3"

  constructor(
    public dialogRef: MatDialogRef<WorkshopAddImageComponent>,
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

  rotateImages() {
    // if (this.imageRotation != 270) {
    //   this.imageRotation += 90;
    // } else {
    //   this.imageRotation = 0;
    // }
    // console.log(this.imageRotation);
    // var image = document.getElementsByClassName("source-image");
    // image[0].className = "source-image degree90"
    // console.log(image);
    var image = document.getElementsByClassName("source-image");
    image["0"].src = this.rotateBase64Image90deg(image["0"].currentSrc);
    this.croppedImage = this.rotateBase64Image90deg(this.croppedImage);
  }

  getRotation() {
    var image = document.getElementsByClassName("source-image");
    var result = 'rotate(' + this.imageRotation + 'deg)'
    console.log(image);
    image[0].className = "source-image degree90"
    return result;
  }

  rotateBase64Image90deg(base64Image) {
    // create an off-screen canvas
    var offScreenCanvas = document.createElement('canvas');
    var offScreenCanvasCtx = offScreenCanvas.getContext('2d');
    var image = document.getElementsByClassName("source-image");
    console.log(image);
    
    // cteate Image
    var img = new Image();
    img.src = base64Image;

    // set its dimension to rotated size
    offScreenCanvas.height = img.width;
    offScreenCanvas.width = img.height;

    // rotate and draw source image into the off-screen canvas:
    offScreenCanvasCtx.rotate(90 * Math.PI / 180);
    offScreenCanvasCtx.translate(0, -offScreenCanvas.width);
    // if (isClockwise) {
    //   offScreenCanvasCtx.rotate(90 * Math.PI / 180);
    //   offScreenCanvasCtx.translate(0, -offScreenCanvas.width);
    // } 
    // else {
    //   offScreenCanvasCtx.rotate(-90 * Math.PI / 180);
    //   offScreenCanvasCtx.translate(-offScreenCanvas.height, 0);
    // }
    offScreenCanvasCtx.drawImage(img, 0, 0);

    // encode image to data-uri with base64
    return offScreenCanvas.toDataURL("image/jpeg", 100);
    // this.croppedImage = offScreenCanvas.toDataURL("image/jpeg", 100);

  }
}