import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { SnackbarService } from '../services/snackbar.service';

export const cartGuard: CanActivateFn = (route, state) => {
  const cartService = inject(CartService);
  const snack = inject(SnackbarService);
  const router = inject(Router);

  if (cartService.itemCount()) {
    return true;
  } else {
    snack.error('Your cart is empty!!!');
    return false;
  }
};
