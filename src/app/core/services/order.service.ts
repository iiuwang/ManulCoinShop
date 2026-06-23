import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, of, tap, map } from 'rxjs';
import { CartItem } from '../models/cart-item.interface';
import { Order, OrderStatus } from '../models/order.interface';
import { AuthService } from './auth.service';
import { StorageService, STORAGE_KEYS } from './storage.service';
@Injectable({
    providedIn: 'root',
})
export class OrderService {

    private readonly authService = inject(AuthService);
    private readonly http = inject(HttpClient);
    private readonly storage = inject(StorageService);

    private readonly ordersUrl = 'api/orders';
    private readonly createOrderUrl = 'api/order';
    

    public getOrders(): Observable<Order[]> {
        console.log('[API] → GET', this.ordersUrl);
        return this.http.get<Order[]>(this.ordersUrl).pipe(
            map((apiOrders) => this.getMergedOrders(apiOrders, this.getSavedOrders())),
            tap((orders) => console.log('[API] ← GET', this.ordersUrl, orders)),
        );
    }

    public createOrder(cartItems: CartItem[]): Observable<Order | null> {
        if (cartItems.length === 0) {
            return of(null);
        }

        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
            return of(null);
        }

        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);

        const newOrder = {
            date: new Date().toISOString().slice(0, 10),
            items: [...cartItems],
            total_price: totalPrice,
            status: OrderStatus.Assembly,
        };

        
        const headers = new HttpHeaders({ 'X-User-Id': String(currentUser.id),});

        return this.http.post<Order>(this.createOrderUrl, newOrder, { headers }).pipe(
            tap((order) => {
                console.log('[API] ← POST', this.createOrderUrl, order);
                this.addOrderToStorage(order);
            }),
        );
    }

    private getMergedOrders(apiOrders: Order[], savedOrders: Order[]): Order[] {
        const merged = [...apiOrders];
        for (const savedOrder of savedOrders) {
            const alreadyExists = merged.some((order) => order.id === savedOrder.id);
            if (!alreadyExists) {
                merged.push(savedOrder);
            }
        }
        return merged;
    }

    private getSavedOrders(): Order[] {
        return this.storage.getObject<Order[]>(STORAGE_KEYS.ORDERS) ?? [];
    }

    private saveOrders(orders: Order[]): void {
        this.storage.setObject(STORAGE_KEYS.ORDERS, orders);
    }

    private addOrderToStorage(order: Order): void {
        const savedOrders = this.getSavedOrders();
        savedOrders.push(order);
        this.saveOrders(savedOrders);
    }
}
