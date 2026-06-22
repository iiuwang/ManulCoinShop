import { Injectable } from "@angular/core";
import { CartItem } from "../models/cart-item.interface";
import { Product } from "../models/product.interface";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class CartService{
    
    private cartItems: CartItem[] = this.getSavedCartItems();
    private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.cartItems);
    public cartItems$ = this.cartItemsSubject.asObservable();
    private nextCartItemId = this.getNextCartItemId(this.cartItems);

    private getSavedCartItems(): CartItem[] {
        const savedCartItems = localStorage.getItem('cartItems');
        if (!savedCartItems) {
          return [];
        }
        return JSON.parse(savedCartItems);
    }

    private getNextCartItemId(items: CartItem[]): number {
      if (items.length === 0) {
        return 0;
      }
      return Math.max(...items.map(item => item.id)) + 1;
    }

    public addToCart(product: Product): void{
        const productItem = this.cartItems.find(item => item.product.id === product.id)
        if(productItem){
            productItem.quantity++;
            this.saveCart();
            return;
        }

        const newCartItem: CartItem = {
            id: this.nextCartItemId++,
            product: product,
            quantity: 1
        }
        this.cartItems.push(newCartItem);
        this.saveCart();
        
    }

    public deleteFromCart(itemDelete: CartItem): void{
        this.cartItems = this.cartItems.filter(cartItem => cartItem.id !==itemDelete.id);
        this.saveCart();
    }

    public changeQuantity(changeItem:  CartItem, newQuantity: number): void{
        if (newQuantity <= 0) {
            this.deleteFromCart(changeItem);
            return;
        }
        const item = this.cartItems.find(cartItem => cartItem.id === changeItem.id);
        if(item){
            item.quantity = newQuantity;
            this.saveCart();
        }
    }

    public clearCart(): void{
        this.cartItems = [];
        this.saveCart();
    }

    public getCartItems(): CartItem[]{
        return [...this.cartItems];
    }

    public getTotalPrice(): number{
        return this.cartItems.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);
    }

    private saveCart(): void{
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
        this.cartItemsSubject.next([...this.cartItems]);

    }
}