import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { CartItem } from '../models/cart-item.interface';
import { Order } from '../models/order.interface';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class OrderService {
    private readonly authService = inject(AuthService);
    private readonly http = inject(HttpClient);

    private readonly ordersUrl = 'api/orders';
    private readonly createOrderUrl = 'api/order';

    public getOrders(): Observable<Order[]> {
        const headers = this.authService.getAuthHeaders();
        if (!headers) {
            return of([]);
        }
        console.log('[API] → GET', this.ordersUrl);
        return this.http.get<Order[]>(this.ordersUrl, { headers }).pipe(
            tap((orders) => console.log('[API] ← GET', this.ordersUrl, orders)),
        );
    }

    public createOrder(cartItems: CartItem[]): Observable<Order | null> {
        if (cartItems.length === 0) {
            return of(null);
        }

        const headers = this.authService.getAuthHeaders();
        if (!headers) {
            return of(null);
        }

        const body = {
            items: cartItems.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
            })),
        };

        return this.http.post<Order>(this.createOrderUrl, body, { headers }).pipe(
            tap((order) => console.log('[API] ← POST', this.createOrderUrl, order)),
        );
    }
}
