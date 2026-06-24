import { Injectable, inject } from '@angular/core';
import { CartItem } from '../models/cart-item.interface';
import { Product } from '../models/product.interface';
import { BehaviorSubject } from 'rxjs';
import { StorageService, STORAGE_KEYS } from './storage.service';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private readonly storage = inject(StorageService);

    private cartItems: CartItem[] = this.getSavedCartItems();
    
    private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.cartItems);
    public cartItems$ = this.cartItemsSubject.asObservable();
    private nextCartItemId = this.getNextCartItemId(this.cartItems);
    

    private getSavedCartItems(): CartItem[] {
        return this.storage.getObject<CartItem[]>(STORAGE_KEYS.CART_ITEMS) ?? [];
    }

    private getNextCartItemId(items: CartItem[]): number {
        let max = -1;
        for (const item of items) {
            if (item.id > max) max = item.id;
        }
        return max + 1;
    }
    
    public addToCart(product: Product): void {
        const productItem = this.cartItems.find((item) => item.product.id === product.id);
        if (productItem) {
            productItem.quantity++;
            this.saveCart();
            return;
        }

        const newCartItem: CartItem = {
            id: this.nextCartItemId++,
            product: product,
            quantity: 1,
        };
        this.cartItems.push(newCartItem);
        this.saveCart();
    }

    public deleteFromCart(itemDelete: CartItem): void {
        this.cartItems = this.cartItems.filter((cartItem) => cartItem.id !== itemDelete.id);
        this.saveCart();
    }

    public changeQuantity(changeItem: CartItem, newQuantity: number): void {
        if (newQuantity <= 0) {
            this.deleteFromCart(changeItem);
            return;
        }
        const item = this.cartItems.find((cartItem) => cartItem.id === changeItem.id);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
        }
    }

    public clearCart(): void {
        this.cartItems = [];
        this.saveCart();
    }

    public getCartItems(): CartItem[] {
        return [...this.cartItems];
    }

    private saveCart(): void {
        this.storage.setObject(STORAGE_KEYS.CART_ITEMS, this.cartItems);
        this.cartItemsSubject.next([...this.cartItems]);
    }
}
