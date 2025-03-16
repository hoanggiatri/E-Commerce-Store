import { PLATFORM_ID, inject, Injectable } from '@angular/core';
import { CartService } from './cart.service';
import { of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private cartService = inject(CartService);
  private platformId = inject(PLATFORM_ID);

  init() {
    if (isPlatformBrowser(this.platformId)) {
      const cartId = localStorage.getItem('cart_id');
      const cart$ = cartId ? this.cartService.getCart(cartId) : of(null);
      return cart$;
    }
    return of(null);
  }
}
