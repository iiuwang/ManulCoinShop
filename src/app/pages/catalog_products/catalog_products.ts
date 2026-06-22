import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../core/services/product.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.interface';
import { CartItem } from '../../core/models/cart-item.interface';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '../../core/services/notification.service';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
    selector: 'app-catalog-products',
    imports: [
        Header,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatFormFieldModule,
        MatOptionModule,
        MatPaginatorModule,
        TranslatePipe,
        MatProgressSpinnerModule,
    ],
    templateUrl: './catalog_products.html',
    styleUrl: './catalog_products.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogProducts {
    private readonly productService = inject(ProductService);
    private readonly cartService = inject(CartService);
    private readonly notification = inject(NotificationService);

    protected readonly isLoading = signal(true);
    protected readonly products = toSignal(
        this.productService.getProducts().pipe(finalize(() => this.isLoading.set(false))),
        { initialValue: [] },
    );
    //для сортировки
    protected readonly typeSort = signal<'default' | 'asc' | 'desc'>('default');
    protected readonly sortedProducts = computed(() => {
        const defaultProducts = this.products();
        if (this.typeSort() === 'default') {
            return defaultProducts;
        }
        if (this.typeSort() === 'asc') {
            const copy = [...defaultProducts];
            return copy.sort((a, b) => a.price - b.price);
        }
        const copy = [...defaultProducts];
        return copy.sort((a, b) => b.price - a.price);
    });

    protected onSortChange(event: MatSelectChange<'default' | 'asc' | 'desc'>): void {
        this.typeSort.set(event.value);
        this.pageIndex.set(0);
    }

    //для пагинации
    protected pageIndex = signal(0);
    protected pageSize = signal(8);
    protected readonly pagedProducts = computed(() => {
        const start = this.pageIndex() * this.pageSize();
        const end = start + this.pageSize();
        return this.sortedProducts().slice(start, end);
    });

    protected onPageChange(event: PageEvent): void {
        this.pageIndex.set(event.pageIndex);
        this.pageSize.set(event.pageSize);
    }

    protected readonly cartItems = toSignal(this.cartService.cartItems$, { initialValue: [] });

    protected addToCart(product: Product): void {
        this.cartService.addToCart(product);
        this.notification.showSuccess('catalog.addedToCart');
    }

    protected increaseQuantity(item: CartItem): void {
        this.cartService.changeQuantity(item, item.quantity + 1);
    }

    protected decreaseQuantity(item: CartItem): void {
        this.cartService.changeQuantity(item, item.quantity - 1);
    }

    protected getCartItem(product: Product, cartItems: CartItem[]): CartItem | undefined {
        return cartItems.find((cartItem) => cartItem.product.id === product.id);
    }
}
