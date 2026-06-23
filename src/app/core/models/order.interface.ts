import { CartItem } from './cart-item.interface';

export interface Order {
    id: number;
    date: string;
    items: CartItem[];
    total_price: number;
    status: OrderStatus;
}

export enum OrderStatus {
    Assembly = 'assembly',
    InTransit = 'in_transit',
    Completed = 'completed',
}