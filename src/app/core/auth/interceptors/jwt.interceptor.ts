import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '@core/auth/services/token.service';

const SESSION_INVALIDATING_STATUSES = [401, 404];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.token();

  const authorizedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      const isAuthEndpoint = req.url.includes('/auth/');
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;

      if (isUnauthorized && !isAuthEndpoint) {
        tokenService.clearToken();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};