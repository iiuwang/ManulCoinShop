import { CartItem } from "./cart-item.interface";

export interface Order{
    id: number;
    date: string;
    items: CartItem[];
    total_price: number;
    status: 'Сборка'|'В пути'|'Выдан';
    
}