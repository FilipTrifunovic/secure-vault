import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        auth.signOut();
      } else if (error.status === 400 || error.status === 422) {
        const errors = error.error?.errors;
        if (errors) {
          const messages = (Object.values(errors) as string[][]).flat().join(', ');
          toast.error(messages || 'Validation error');
        } else {
          toast.error(error.error?.message || 'Validation error');
        }
      } else if (error.status >= 500) {
        toast.error('Server error. Please try again.');
      }
      return throwError(() => error);
    })
  );
};
