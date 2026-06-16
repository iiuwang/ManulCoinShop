import { Component, inject } from '@angular/core';
import { Header} from '../../shared/components/header/header';
import { AsyncPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.interface';
import { CartItem } from '../../core/models/cart-item.interface';
@Component({
  selector: 'app-catalog-products',
  imports: [Header, AsyncPipe, MatButtonModule, MatIconModule],
  templateUrl: './catalog_products.html',
  styleUrl: './catalog_products.scss',
})
export class CatalogProducts {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  protected readonly cartItems$ = this.cartService.cartItems$;
  protected readonly products$ = this.productService.getProducts();

  protected addToCart(product: Product): void{
    this.cartService.addToCart(product);
  }

  protected increaseQuantity(item: CartItem): void{
    this.cartService.changeQuantity(item ,item.quantity+1)
  }

  protected decreaseQuantity(item: CartItem): void{
    this.cartService.changeQuantity(item, item.quantity-1)
  }

  protected getCartItem(product: Product, cartItems: CartItem[]): CartItem | undefined {
    return cartItems.find(cartItem => cartItem.product.id === product.id);
  }
}
