import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
  signOut,
  UserCredential,
  fetchSignInMethodsForEmail,
} from '@angular/fire/auth';
import { Environment } from '../../../environment/environment';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import { LoginResponseDto, SignUpResponseDto, UserModel } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private auth: Auth,
    private http: HttpClient,
  ) {}

  private readonly environment = new Environment();
  private baseUrl = this.environment.getApiUrl();

  private readonly user = new BehaviorSubject<UserModel | null>(null);
  readonly user$ = this.user.asObservable();
  getUser() {
    return this.user.getValue();
  }
  setUser(user: UserModel) {
    this.user.next(user);
  }

  get currentUser() {
    return this.auth.currentUser;
  }

  async onLogIn(email: string, password: string) {
    if (this.auth.currentUser) {
      await signOut(this.auth);
    }

    return await signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        return userCredential;
      })
      .catch((error) => {
        throw error;
      });
  }

  async validateLogin(userCredential: UserCredential) {
    const token = await userCredential.user.getIdToken(true);

    return firstValueFrom(
      this.http
        .post<LoginResponseDto>(
          this.baseUrl + 'api/user/login',
          {
            Email: userCredential.user.email,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        .pipe(
          map((response) => ({
            email: response.email,
            name: response.name,
          })),
        ),
    );
  }

  async onSignUp(email: string, password: string) {
    if (this.auth.currentUser) {
      await signOut(this.auth);
    }

    return await createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        return userCredential;
      })
      .catch((error) => {
        throw error;
      });
  }

  async saveUser(userCredential: UserCredential, name: string) {
    const token = await userCredential.user.getIdToken(true);

    return firstValueFrom(
      this.http
        .post<SignUpResponseDto>(
          this.baseUrl + 'api/user/signup',
          {
            Email: userCredential.user.email,
            Name: name,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        .pipe(
          map((response) => ({
            email: response.email,
            name: response.name,
          })),
        ),
    );
  }

  async checkIfUserExistInDatabase(userCredential: UserCredential) {
    const token = await userCredential.user.getIdToken(true);

    return await firstValueFrom(
      this.http.post<boolean>(
        this.baseUrl + 'api/user/check',
        {
          Email: userCredential.user.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      ),
    );
  }
}
