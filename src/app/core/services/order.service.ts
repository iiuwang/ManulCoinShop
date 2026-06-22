import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, tap, map } from "rxjs";
import { CartItem } from "../models/cart-item.interface";
import { Order, OrderStatus } from "../models/order.interface";

@Injectable({
    providedIn: 'root',
})
export class OrderService{
    private readonly ordersUrl = 'api/orders';
    private readonly createOrderUrl = 'api/order';
    
    constructor(private readonly http: HttpClient) {}

    public getOrders(): Observable<Order[]>{
        console.log('[API] → GET', this.ordersUrl);
        return this.http.get<Order[]>(this.ordersUrl).pipe(
            map((apiOrders) => this.mergeOrders(apiOrders, this.getSavedOrders())),
            tap((orders) => console.log('[API] ← GET', this.ordersUrl, orders)),
        );
    }

    public createOrder(cartItems: CartItem[]): Observable<Order | null>{
        if(cartItems.length === 0){
            return of(null);
        }

        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);

        const newOrder = {
            date: new Date().toISOString().slice(0, 10),
            items: [...cartItems],
            total_price: totalPrice,
            status: 'assembly' as const
        }

        console.log('[API] → POST', this.createOrderUrl, newOrder);
        return this.http.post<Order>(this.createOrderUrl, newOrder).pipe(
            tap((order) => {console.log('[API] ← POST', this.createOrderUrl, order);
            this.addOrderToStorage(order);
        }),
        );
    }

    private mergeOrders(apiOrders: Order[], savedOrders: Order[]): Order[] {
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
        const savedOrders = localStorage.getItem('orders');
        if (!savedOrders) {
          return [];
        }
        return JSON.parse(savedOrders);
    }

    private saveOrders(orders: Order[]): void {
        localStorage.setItem('orders', JSON.stringify(orders));
      }

    private addOrderToStorage(order: Order): void {
      const savedOrders = this.getSavedOrders();
      savedOrders.push(order);
      this.saveOrders(savedOrders);
    }
}