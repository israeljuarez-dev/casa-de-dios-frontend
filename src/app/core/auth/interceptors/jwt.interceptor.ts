import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '@core/auth/services/token.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const tokenService = inject(TokenService);
  
  const token = tokenService.token();

  if (!token) {
    return next(req);
  }

  const authorizedReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authorizedReq);
};