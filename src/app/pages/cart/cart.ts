import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartItem } from '../../core/models/cart-item.interface';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { Header } from '../../shared/components/header/header';
import { NotificationService } from '../../core/services/notification.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-cart',
    imports: [Header, RouterLink, MatIconModule, MatButtonModule, TranslatePipe],
    templateUrl: './cart.html',
    styleUrl: './cart.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
    private readonly cartService = inject(CartService);
    private readonly orderService = inject(OrderService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly notification = inject(NotificationService);
    protected readonly cartItems = toSignal(this.cartService.cartItems$, { initialValue: [] });
    
    protected readonly itemsCount = computed(() =>
        this.cartItems().reduce((total, item) => total + item.quantity, 0),
    );
    protected readonly totalPrice = computed(() =>
        this.cartItems().reduce((total, item) => total + item.product.price * item.quantity, 0),
    );

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

    protected checkout(): void {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return;

        const totalPrice = this.totalPrice();
        if (currentUser.balance < totalPrice) {
            this.notification.showError('cart.notEnoughMoney');
            return;
        }
        this.orderService.createOrder(this.cartService.getCartItems()).subscribe({
            next: (order) => {
                if (!order) return;
                this.cartService.clearCart();
                this.authService.updateBalance(currentUser.balance - totalPrice);
                this.notification.showSuccess('cart.orderSuccess');
                this.router.navigate(['/orders']);
            },
            error: () => {
                this.notification.showError('cart.orderError');
            },
        });
    }
}
