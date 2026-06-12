import { Injectable } from "@angular/core";
import { CartItem } from "../models/cart-item.interface";
import { BehaviorSubject } from "rxjs";
import { Order } from "../models/order.interface";

@Injectable({
    providedIn: 'root',
})
export class OrderService{
    private orders: Order[] = [];
    private ordersSubject = new BehaviorSubject<Order[]>([]);
    public orders$ = this.ordersSubject.asObservable();
    private nextOrderId = 1;

    public getOrders(): Order[]{
        return [...this.orders];
    }

    public createOrder(cartItems: CartItem[]): void{
        if(cartItems.length === 0){
            return;
        }

        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);

        const newOrder: Order = {
            id: this.nextOrderId++,
            date: new Date().toISOString(),
            items: [...cartItems],
            total_price: totalPrice,
            status: 'Сборка'
        }

        this.orders.push(newOrder);
        this.ordersSubject.next([...this.orders]);
    }
}