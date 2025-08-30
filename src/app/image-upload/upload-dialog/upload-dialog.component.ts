import { Component, Inject, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DataService } from '../data.service';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss'],
})
export class UploadDialogComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  msg: any;
  needCrop: boolean = false;
  maxWidthCrop: any = 200;
  maxHeightCrop: any = 200;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  signForm!: FormGroup;
  selectedFile!: File;
  signUploadName: any;
  imageUrl: any;
  signUploadExt: any;
  stream!: MediaStream;
  capturedImage: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dataServ: DataService,
  ) { this.msg = data; }

  ngOnInit(): void {
    this.signForm = new FormGroup({
      signimage: new FormControl('', Validators.required),
    });
    this.maxHeightCrop = 200;
    this.maxWidthCrop = 200;
    this.needCrop = false;

    if (this.msg === 'realTime') {
      this.startCamera();
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  async startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (this.videoElement) {
          this.videoElement.nativeElement.srcObject = this.stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Could not access the camera. Please check permissions and try again.');
      }
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  captureImage() {
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.capturedImage = canvas.toDataURL('image/png');
        this.imageUrl = this.capturedImage;
        this.stopCamera();
    }
  }

  onPick(event: any) {
    this.imageChangedEvent = event;
    this.maxHeightCrop = 200;
    this.maxWidthCrop = 200;
    this.needCrop = false;
    if (event.target.files.length > 0) {
      this.selectedFile = <File>event.target.files[0];

      if (this.selectedFile.type === 'image/jpeg' || this.selectedFile.type === 'image/png') {

        if ((this.selectedFile.size / 1024) > 100) {
          this.signUploadName = '';
          this.imageUrl = '';
          this.signUploadExt = '';
          alert('Image size should be less than 100KB');
          this.signForm.patchValue({ signimage: '' });
          return;
        }

        this.signUploadName = this.selectedFile.name;
        let arr = this.selectedFile.type.split('/');
        this.signUploadExt = arr[1];
        // console.log(this.signUploadExt);
        const reader = new FileReader();
        reader.onload = (event: any) => {
          this.imageUrl = event.target.result;
        };
        reader.readAsDataURL(this.selectedFile);
        return;
      }

      else {
        this.signUploadName = '';
        this.imageUrl = '';
        this.signUploadExt = '';
        alert('Image type is not Supported');
        this.signForm.patchValue({ signimage: '' });
        return;
      }
    }

    else {
      this.signUploadName = '';
      this.imageUrl = '';
      this.signUploadExt = '';
      console.log('No file choosen');
      return;
    }
  }

  needCropButton() {
    this.needCrop = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded(image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
  onUpload() {
    if (this.capturedImage) {
      this.dataServ.getImage(this.capturedImage);
    } else if (!this.needCrop) {
      this.dataServ.getImage(this.imageUrl);
    } else {
      this.dataServ.getImage(this.croppedImage);
    }
  }
}