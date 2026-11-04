import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthSession, SignUpRequest, User } from './models';

const STORAGE_KEY = 'nutrigain.session';

/** Holds the JWT session. The token is the only thing kept in the browser; everything else comes from the API. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<AuthSession | null>(this.restore());

  readonly user = computed<User | null>(() => this.session()?.user ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string | null {
    return this.session()?.token ?? null;
  }

  isLoggedIn(): boolean {
    return this.token !== null;
  }

  signIn(email: string, password: string): Observable<AuthSession> {
    return this.http
      .post<AuthSession>(`${environment.apiUrl}/auth/sign-in`, { email, password })
      .pipe(tap(session => this.store(session)));
  }

  signUp(request: SignUpRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/sign-up`, request);
  }

  logout(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable: nothing to clean
    }
    this.router.navigate(['/login']);
  }

  private store(session: AuthSession): void {
    this.session.set(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // storage unavailable: the session lives only in memory
    }
  }

  private restore(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }
}
