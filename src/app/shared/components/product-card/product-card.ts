import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '../../../core/models/product.interface';
import { CartItem } from '../../../core/models/cart-item.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-product-card',
    imports: [MatIconModule, MatButtonModule, TranslatePipe],
    templateUrl: './product-card.html',
    styleUrl: './product-card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
    product = input.required<Product>();
    cartItem = input<CartItem>();

    addToCart = output<void>();
    increase = output<void>();
    decrease = output<void>();
}