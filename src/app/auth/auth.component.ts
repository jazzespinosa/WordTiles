import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit {
  loginForm!: FormGroup;
  signUpForm!: FormGroup;
  toggleIsSignUp = false; // toggle
  isLoginSubmit = false;
  isSignUpSubmit = false;

  loginErrorMessage: string | null = null;
  signUpErrorMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      loginInputEmail: [
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(64),
        ]),
      ],
      loginInputPassword: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
        ]),
      ],
    });

    this.signUpForm = this.formBuilder.group({
      signUpInputName: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(64),
        ]),
      ],
      signUpInputEmail: [
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(64),
        ]),
      ],
      signUpInputPassword: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
        ]),
      ],
    });
  }

  onLogIn() {
    this.isLoginSubmit = true;
    this.isSignUpSubmit = false;
    this.loginErrorMessage = null;

    if (this.loginForm.invalid) {
      alert('Form is invalid! Please check the fields.');
      return;
    }

    const email = this.loginForm.value.loginInputEmail;
    const password = this.loginForm.value.loginInputPassword;

    this.authService
      .onLogIn(email, password)
      .then((userCredential) => {
        this.loginErrorMessage = null;
        this.authService
          .validateLogin(userCredential)
          .then((userCredentialValidated) => {
            this.authService.setUser({
              email: userCredentialValidated.email,
              name: userCredentialValidated.name,
            });
            this.router.navigate(['/play']);
          });
      })
      .catch((err) => {
        if (err.code === 'auth/invalid-credential') {
          this.loginErrorMessage = 'Invalid email or password.';
        } else {
          this.loginErrorMessage = 'Login failed. Try again.';
        }
      });
  }

  onSignUp() {
    this.isLoginSubmit = false;
    this.isSignUpSubmit = true;
    this.signUpErrorMessage = null;

    if (this.signUpForm.invalid) {
      alert('Form is invalid! Please check the fields.');
      return;
    }

    const name = this.signUpForm.value.signUpInputName;
    const email = this.signUpForm.value.signUpInputEmail;
    const password = this.signUpForm.value.signUpInputPassword;

    this.authService
      .onSignUp(email, password)
      .then((userCredential) => {
        this.signUpErrorMessage = null;
        this.authService.saveUser(userCredential, name);
        console.log(userCredential);
      })
      .catch((err) => {
        if (err.code === 'auth/email-already-in-use') {
          this.authService
            .onLogIn(email, password)
            .then((userCredentialAfterError) => {
              this.authService
                .checkIfUserExistInDatabase(userCredentialAfterError)
                .then((exist) => {
                  if (exist) {
                    this.signUpErrorMessage =
                      'Email address is already in use.';
                  } else {
                    this.authService.saveUser(userCredentialAfterError, name);
                  }
                })
                .catch(() => {
                  this.signUpErrorMessage = 'Signup failed. Try again.';
                });
            })
            .catch(() => {
              this.signUpErrorMessage = 'Email address is already in use.';
            });
        } else {
          this.signUpErrorMessage = 'Signup failed. Try again.';
        }
      });
  }

  toggleButton(): void {
    this.toggleIsSignUp = !this.toggleIsSignUp;
    this.reset();
  }

  private reset() {
    this.isLoginSubmit = false;
    this.isSignUpSubmit = false;
    this.loginErrorMessage = null;
    this.signUpErrorMessage = null;
    this.loginForm.reset();
    this.signUpForm.reset();
  }

  get loginInputEmail() {
    return this.loginForm.controls['loginInputEmail'];
  }

  get loginInputPassword() {
    return this.loginForm.controls['loginInputPassword'];
  }

  get signUpInputName() {
    return this.signUpForm.controls['signUpInputName'];
  }

  get signUpInputEmail() {
    return this.signUpForm.controls['signUpInputEmail'];
  }

  get signUpInputPassword() {
    return this.signUpForm.controls['signUpInputPassword'];
  }
}
