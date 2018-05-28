import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ImageCropperComponent, CropperSettings, Bounds } from "ngx-img-cropper";

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
  croppedImage: any;
  data1: any;
  cropperSettings1: CropperSettings;
  croppedWidth: number;
  croppedHeight: number;

  swapImage: boolean;
  uploadCompleted: boolean = true;
  processing: boolean;
  compressedFile: any;

  @ViewChild('cropper', undefined) cropper: ImageCropperComponent;

  constructor(
    private presenterService: PresenterService,
    private router: Router,
    private route: ActivatedRoute,
    private flashMessage: FlashMessagesService,
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

    this.cropperSettings1.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
    this.cropperSettings1.cropperDrawSettings.strokeWidth = 2;
    this.cropperSettings1.cropperClass = "cropper-tool";

    this.data1 = {};
  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.presenterService.getPresenter(this.id).subscribe(presenter => this.presenter = presenter);
    var width = document.getElementsByClassName('card-body')["0"].offsetWidth;
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
              if (error) {
                console.log("error")
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
    })
  }

  imageSelect() {
    this.processing = true;
    var image = document.getElementById('cropped-result');
    var myFile: File = this.finishedImageToFile(image);
    if (myFile.size > 5000000) {
      this.compressImage(myFile, 0.250)
    } else if (myFile.size > 3000000) {
      this.compressImage(myFile, 0.125)
    } else {
      this.compressImage(myFile, 0.075)
    }
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

  onDeleteClick() {
    this.presenterService.deletePresenter(this.presenter);
    this.flashMessage.show('Presenter Removed', {
      cssClass: 'alert-success', timeout: 4000
    });
    this.router.navigate(['/presenters']);
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
          this.presenter.imageURL = downloadURL;
        });
      })
    )
      .subscribe(null, null, () => this.uploadComplete());
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