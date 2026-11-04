import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/** Adds the Bearer token to API calls and logs out when the backend says the token is no longer valid. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isApiCall = req.url.startsWith(environment.apiUrl);
  const token = auth.token;
  const request = isApiCall && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError(error => {
      if (error?.status === 401 && isApiCall && !req.url.includes('/auth/')) {
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};
