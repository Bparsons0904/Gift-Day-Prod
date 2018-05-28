import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs/Subscription';

type UserFields = 'email' | 'password';
type FormErrors = { [u in UserFields]: string };

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  subscription: Subscription;

  user: User;
  email: string;
  password: string;
  userForm: FormGroup;
  newUser = false; // to toggle login or signup form
  passReset = false; // set to true when password reset is triggered
  formErrors: FormErrors = {
    'email': '',
    'password': '',
  };
  validationMessages = {
    'email': {
      'required': 'Email is required.',
      'email': 'Email must be a valid email',
    },
    'password': {
      'required': 'Password is required.',
      'pattern': 'Password must be include at one letter and one number.',
      'minlength': 'Password must be at least 6 characters long.',
      'maxlength': 'Password cannot be more than 25 characters long.',
    },
  };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private userService: UserService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) { 
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/mdi.svg'));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.buildForm();
  }

  signInWithGoogle() {
    this.auth.googleLogin()
      .then(() => this.afterSignIn());
  }

  signInWithFacebook() {
    this.auth.facebookLogin()
      .then(() => this.afterSignIn());
  }


  // signInWithTwitter() {
  //   this.auth.twitterLogin()
  //     .then(() => this.afterSignIn());
  // }

  toggleForm() {
    this.newUser = !this.newUser;
  }

  signup() {
    this.auth.emailSignUp(this.userForm.value['email'], this.userForm.value['password'])
    .then(() => this.afterSignIn());
  }

  login() {
    this.auth.emailLogin(this.userForm.value['email'], this.userForm.value['password'])
      .then(() => this.afterSignIn());
  }

  resetPassword() {
    this.auth.resetPassword(this.userForm.value['email'])
      .then(() => this.passReset = true);
  }

  buildForm() {
    this.userForm = this.fb.group({
      'email': ['', [
        Validators.required,
        Validators.email,
      ]],
      'password': ['', [
        Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25),
      ]],
    });

    this.userForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged(); // reset validation messages
  }

  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.userForm) { return; }
    const form = this.userForm;
    for (const field in this.formErrors) {
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'email' || field === 'password')) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          if (control.errors) {
            for (const key in control.errors) {
              if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                this.formErrors[field] += `${(messages as { [key: string]: string })[key]} `;
              }
            }
          }
        }
      }
    }
  }

  /// Shared
  private afterSignIn() {
    this.subscription = this.userService.getUser(this.auth.getId()).subscribe(user => {
      this.user = user;
      if (this.user.admin) {
        this.userService.admin = true;
      }
      if ((this.user.displayName !== undefined) && (this.user.school !== undefined) && (this.user.grade !== undefined)) {
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/profile']);
      }

    });
  }

}
