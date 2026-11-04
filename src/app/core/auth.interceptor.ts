import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

/** Adds the Bearer token to API calls, logs out on 401 and reports network/server failures to the user. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const isApiCall = req.url.startsWith(environment.apiUrl);
  const token = auth.token;
  const request = isApiCall && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError(error => {
      if (isApiCall) {
        if (error?.status === 401 && !req.url.includes('/auth/')) {
          auth.logout();
        } else if (error?.status === 0) {
          toast.error('No se pudo conectar con el servidor. Revisa tu conexión.');
        } else if (error?.status >= 500) {
          toast.error('Ocurrió un error en el servidor. Intenta de nuevo.');
        }
      }
      return throwError(() => error);
    })
  );
};
