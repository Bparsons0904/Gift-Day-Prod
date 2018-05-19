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

  @ViewChild('presenterForm') form: any;

  constructor(
    private presenterService: PresenterService,
    private flashMessage: FlashMessagesService,
    private router: Router,
    private storage: AngularFireStorage,
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
    const file = event.target.files[0];
    const filePath = `media/images/workshops/${new Date().getTime()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    if (file.type.split('/')[0] !== 'image') {
      console.error('unsupported file type :( ')
      return;
    }
    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available

    // this.percentage = this.task.percentageChanges();
    // this.snapshot = this.task.snapshotChanges();
    

    task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();
        this.downloadURL.subscribe(downloadURL => {
          this.presenter.imageURL = downloadURL;
        });
      })
    )
    .subscribe();

    // task.snapshotChanges().pipe(
    //   finalize(() => {
    //     this.downloadURL = fileRef.getDownloadURL(); 
    //   })
    // )
    // .subscribe();


    // function doAsyncTask() {
    //   return new Promise((resolve, reject) => {
    //     console.log("Promise ran");
        
    //     task.snapshotChanges().pipe(
    //       finalize(() => this.downloadURL = fileRef.getDownloadURL())
    //     )
    //       .subscribe();
    //   });
    // }

    // doAsyncTask().then(
    //   () => this.downloadURL.subscribe(downloadURL => {
    //     console.log(downloadURL);
        
    //     this.presenter.imageURL = downloadURL;
    //   }),
    //   (err) => console.error(err)
    // );
    // this.downloadURL.subscribe(downloadURL => {
    //   this.imageURL = downloadURL;
    // })
    // this.downloadURL.subscribe(imageURL => {
    //   this.imageURL = imageURL;
    //   this.presenter.imageURL = this.imageURL;
    // });
  }

  // setImageURL() {
  //   this.downloadURL.subscribe(downloadURL => {
  //     this.presenter.imageURL = downloadURL;
  //   });
  // }

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
    const fileRef = this.storage.ref(path);
    const task = this.storage.upload(path, file);
    // Totally optional metadata
    const customMetadata = { app: 'GIFT Day App' };

    // The main task
    this.task = this.storage.upload(path, file, { customMetadata })

    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges();

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
    // this.downloadURL = fileRef.getDownloadURL()
    task.snapshotChanges().pipe(
      finalize(() => this.downloadURL = fileRef.getDownloadURL())
    )
      .subscribe()

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
