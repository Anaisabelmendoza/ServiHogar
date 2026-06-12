import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * AuthInterceptor
 * --------------
 * Inyecta automáticamente el token Bearer en todas las peticiones HTTP.
 * También maneja errores 401 (token caducado) redirigiendo al login.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');

    // Si hay token, clona la petición añadiendo el header de autorización
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el servidor responde 401, el token es inválido o ha caducado
        if (error.status === 401) {
          // Limpiar sesión
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('user_id');
          localStorage.removeItem('user_name');
          // Redirigir al login
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
