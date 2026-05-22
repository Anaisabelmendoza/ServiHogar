import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Guard para verificar que el usuario esté autenticado
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

// Guard para verificar que el usuario sea CLIENTE
export const clientGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = localStorage.getItem('role');

  if (role === 'client' || role === 'cliente') {
    return true;
  }

  // Si es worker, lo redirigimos a su home de profesional
  if (role === 'worker') {
    router.navigate(['/worker-home']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};

// Guard para verificar que el usuario sea PROFESIONAL (worker)
export const workerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = localStorage.getItem('role');

  if (role === 'worker') {
    return true;
  }

  // Si es cliente, lo redirigimos a su home de cliente
  if (role === 'client' || role === 'cliente') {
    router.navigate(['/home']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};

// Guard para evitar entrar a Login/Register si ya está autenticado
export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token) {
    if (role === 'worker') {
      router.navigate(['/worker-home']);
    } else {
      router.navigate(['/home']);
    }
    return false;
  }

  return true;
};
