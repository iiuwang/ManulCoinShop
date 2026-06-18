import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../core/models/cart-item.interface';
import { CartService } from '../../core/services/cart.service';
import { Header } from '../../shared/components/header/header';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cart',
  imports: [Header, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private readonly cartService = inject(CartService);
  protected readonly cartItems = toSignal(this.cartService.cartItems$,{initialValue: []});

  protected readonly itemsCount = computed(() => this.cartItems().reduce((total, item) => total+item.quantity, 0));
  protected readonly totalPrice = computed(() => this.cartItems().reduce((total, item) => total+item.product.price*item.quantity, 0));
  
  protected increaseQuantity(item: CartItem): void {
    this.cartService.changeQuantity(item, item.quantity + 1);
  }
  
  protected decreaseQuantity(item: CartItem): void {
    this.cartService.changeQuantity(item, item.quantity - 1);
  }
  
  protected removeFromCart(item: CartItem): void {
    this.cartService.deleteFromCart(item);
  }

  protected clearCart(): void {
    this.cartService.clearCart();
  }
}
