import { Component, OnInit, ViewChild } from '@angular/core';
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

import {
  ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';
import { ImageCropperComponent, CropperSettings, Bounds } from "ngx-img-cropper";
import { resolve, reject } from 'q';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
  compressedFile: any;

  croppedImage: any;
  name: string;
  data1: any;
  cropperSettings1: CropperSettings;
  croppedWidth: number;
  croppedHeight: number;

  swapImage: boolean;
  uploadCompleted: boolean = true;
  processing: boolean;
  
  @ViewChild('cropper', undefined) cropper: ImageCropperComponent;

  constructor(
    private wss: WorkshopsService,
    private router: Router,
    private route: ActivatedRoute,
    private flashMessage: FlashMessagesService,
    private presenterService: PresenterService,
    private storage: AngularFireStorage,
    private dialog: MatDialog,
    private ng2ImgMax: Ng2ImgMaxService,
  ) {
    this.name = 'Angular2'
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

    // this.cropperSettings1.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
    // this.cropperSettings1.cropperDrawSettings.strokeWidth = 2;
    this.cropperSettings1.cropperClass = "cropper-tool";

    this.data1 = {};
   }

  imageSwap() {
    this.swapImage = !this.swapImage;
  }

  cropped(bounds: Bounds) {
    this.croppedHeight = bounds.bottom - bounds.top;
    this.croppedWidth = bounds.right - bounds.left;
  }

  finishedImageToFile(image) {
    var myBlob: Blob = this.dataURItoBlob(image.src);
    let myFile = new File([myBlob], "workshop-image.jpg", { type: 'image/jpeg' });
    return myFile;
  }

  compressImage(myFile, compression) {
    return new Promise((resolve, reject) => {
      this.ng2ImgMax.compressImage(myFile, compression).subscribe(
        result => {
          this.compressedFile = new File([result], "workshop-image.jpg", { type: 'image/jpeg' }),
          error => {
            if(error) {
            console.log("error")
          }}
            ,
            this.imageSwap();
            this.uploadFile(this.compressedFile);
        },
        error => {
          console.log('😢 Oh no!', error);
        }
      );
    })
  }

  imageSelect() {
    this.processing = true;
    var image = document.getElementById('cropped-result');
    var myFile: File = this.finishedImageToFile(image);
    if(myFile.size > 5000000) {
      this.compressImage(myFile, 0.250)
    } else if (myFile.size > 3000000){
      this.compressImage(myFile, 0.125)
    } else {
      this.compressImage(myFile, 0.075)
    }
    // this.compressImage(myFile, compression)
  }

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

  uploadComplete() {
    this.uploadCompleted = true;
    this.processing = false;
  }

  uploadFile(event) {
    this.uploadCompleted = false;
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
      .subscribe(
        null, null, () => this.uploadComplete()
      );
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

        this.ng2ImgMax.compressImage(myFile, 0.100).subscribe(
          result => {
            myFile = new File([result], "workshop-image.jpg", { type: 'image/jpeg' });
            // this.uploadFile(myFile);
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
  template: ``,
  styles: []
})
export class WorkshopEditImageComponent {

  // aspect: string = "4 / 3"

  data: any;
  cropperSettings: CropperSettings;
  @ViewChild('cropper', undefined)
  cropper: ImageCropperComponent;

  constructor(
    public dialogRef: MatDialogRef<WorkshopEditImageComponent>,
    // private ng2ImgToolsService: Ng2ImgToolsService,
    // private sanitizer: DomSanitizer,
    private ng2ImgMax: Ng2ImgMaxService,
    

    @Inject(MAT_DIALOG_DATA) public data_dialog: any,
  ) { 
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.width = 100;
    this.cropperSettings.height = 100;
    this.cropperSettings.croppedWidth = 100;
    this.cropperSettings.croppedHeight = 100;
    this.cropperSettings.canvasWidth = 400;
    this.cropperSettings.canvasHeight = 300;

    this.data = {};
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

  fileChangeListener($event) {
    var image: any = new Image();
    var file: File = $event.target.files[0];
    var myReader: FileReader = new FileReader();
    var that = this;
    myReader.onloadend = function (loadEvent: any) {
      image.src = loadEvent.target.result;
      that.cropper.setImage(image);

    };

    myReader.readAsDataURL(file);
  }
  // imageChangedEvent: any = '';
  // croppedImage: any = '';
  // imageRotation: number = 0;
  // imageFinishedLoading: boolean;
  // imageEXIF: any;
  // originalImage: any;
  
  // getEXIFOrientedImage(image: HTMLImageElement): Promise<HTMLImageElement> {
  //   return this.ng2ImgToolsService.getEXIFOrientedImage(image);
  // }

  // convertBase64Image(imageBase64: string) {
  //   this.originalImage = new Image();
  //   // this.safeImgDataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(imageBase64);
  //   this.originalImage.src = imageBase64;
  //   console.log(imageBase64);
  //   console.log(this.originalImage);
    
  //   this.imageEXIF = this.getEXIFOrientedImage(this.originalImage);
  //   console.log("Convert done");
  // }

  // fileChangeEvent(event: any): void {
  //   // const fileReader = new FileReader();
  //   // fileReader.onload = (ev: any) => {
  //   //   if (event.target.files[0].type === 'image/jpeg' ||
  //   //     event.target.files[0].type === 'image/jpg' ||
  //   //     event.target.files[0].type === 'image/png' ||
  //   //     event.target.files[0].type === 'image/gif') {
  //   //       // this.convertBase64Image(ev.target.result);
  //   //       // console.log(event.target.files[0].type);
  //   //       console.log(ev);
  //   //     this.imageEXIF = this.getEXIFOrientedImage(event.target.files[0]);
        
  //   //       // this.imageEXIF = this.getEXIFOrientedImage(ev.target.result);
  //   //       console.log(this.imageEXIF);
  //   //       this.imageChangedEvent = this.imageEXIF;
  //   //   }
  //   // };
  //   // fileReader.readAsDataURL(event.target.files[0]);
  //   // console.log(this.imageEXIF);
  //   // let myFile = event.target.files[0];

  //   // console.log(myFile);
    
  //   // this.ng2ImgMax.compressImage(myFile, 0.100).subscribe(
  //   //   result => {
  //   //     console.log(result);
  //   //     myFile = new File([result], "workshop-image.jpg", { type: 'image/jpeg' });
  //   //     // let image = this.getEXIFOrientedImage(result);
  //   //     // console.log(image);
  //   //     console.log(myFile);
        
  //   //     // myFile = new File([image], "workshop-image.jpg", { type: 'image/jpeg' });
  //   //   },
  //   //   error => {
  //   //     console.log('😢 Oh no!', error);
  //   //   }
  //   // );
  //   this.imageChangedEvent = event;
  // }
  // imageCropped(image: string) {
  //   this.croppedImage = image;
  // }
  // imageLoaded() {
  //   // show cropper
  //   console.log(this.croppedImage);
    
  //   this.imageFinishedLoading = true;
  //   let source = document.getElementsByClassName("source-image");
  //   console.log(source);
  //   let image = new Image(1000, 1000);
  //   image.src = source["0"].src 
  //   console.log(image);
  //   console.log(this.getEXIFOrientedImage(image));
    
  //   this.imageEXIF = this.getEXIFOrientedImage(image);
  //   console.log(this.imageEXIF.__zone_symbol__value.src);
  //   console.log(this.croppedImage);
    
  //   this.croppedImage = this.imageEXIF = this.getEXIFOrientedImage(image);
  // }
  // loadImageFailed() {
  //   // show message
  // }

}