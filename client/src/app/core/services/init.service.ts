import { PLATFORM_ID, inject, Injectable } from '@angular/core';
import { CartService } from './cart.service';
import { forkJoin, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private cartService = inject(CartService);
  private platformId = inject(PLATFORM_ID);
  private accountService = inject(AccountService);

  init() {
    if (isPlatformBrowser(this.platformId)) {
      const cartId = localStorage.getItem('cart_id');
      const cart$ = cartId ? this.cartService.getCart(cartId) : of(null);

      return forkJoin({
        cart: cart$,
        user: this.accountService.getUserInfo(),
      });
    }
    return of(null);
  }
}
