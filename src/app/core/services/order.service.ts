import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { CartItem } from "../models/cart-item.interface";
import { Order } from "../models/order.interface";

@Injectable({
    providedIn: 'root',
})
export class OrderService{
    private readonly apiUrl = 'api/orders';
    constructor(private readonly http: HttpClient) {}

    // private orders: Order[] = [];
    // private ordersSubject = new BehaviorSubject<Order[]>([]);
    // public orders$ = this.ordersSubject.asObservable();
    // private nextOrderId = 1;

    public getOrders(): Observable<Order[]>{
        return this.http.get<Order[]>(this.apiUrl);
    }

    public createOrder(cartItems: CartItem[]): Observable<Order | null>{
        if(cartItems.length === 0){
            return of(null);
        }

        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);

        const newOrder = {
            date: new Date().toISOString(),
            items: [...cartItems],
            total_price: totalPrice,
            status: 'Сборка' as const
        }

        return this.http.post<Order>(this.apiUrl, newOrder);
        // this.orders.push(newOrder);
        // this.ordersSubject.next([...this.orders]);
    }
}