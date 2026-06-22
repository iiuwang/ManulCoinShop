import { CartItem } from './cart-item.interface';

export interface Order {
    id: number;
    date: string;
    items: CartItem[];
    total_price: number;
    status: OrderStatus;
}

export type OrderStatus = 'assembly' | 'in_transit' | 'completed';
