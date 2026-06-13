import { Injectable } from "@angular/core";
import { CartItem } from "../models/cart-item.interface";
import { Product } from "../models/product.interface";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class CartService{
    
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
    public cartItems$ = this.cartItemsSubject.asObservable();
    private cartItems: CartItem[] = [];
    private nextCartItemId = 0;

    public addToCart(product: Product): void{
        const productItem = this.cartItems.find(item => item.product.id === product.id)
        if(productItem){
            productItem.quantity++;
            this.cartItemsSubject.next([...this.cartItems]);
            return;
        }

        const newCartItem: CartItem = {
            id: this.nextCartItemId++,
            product: product,
            quantity: 1
        }
        this.cartItems.push(newCartItem);
        this.cartItemsSubject.next([...this.cartItems]);
        
    }

    public deleteFromCart(itemDelete: CartItem): void{
        this.cartItems = this.cartItems.filter(cartItem => cartItem.id !==itemDelete.id);
        this.cartItemsSubject.next([...this.cartItems]);
    }

    public changeQuantity(changeItem:  CartItem, newQuantity: number): void{
        if (newQuantity <= 0) {
            this.deleteFromCart(changeItem);
            return;
        }
        const item = this.cartItems.find(cartItem => cartItem.id === changeItem.id);
        if(item){
            item.quantity = newQuantity;
            this.cartItemsSubject.next([...this.cartItems]);
        }
    }

    public clearCart(): void{
        this.cartItems = [];
        this.cartItemsSubject.next([...this.cartItems]);
    }

    public getCartItems(): CartItem[]{
        return [...this.cartItems];
    }

    public getTotalPrice(): number{
        return this.cartItems.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);
    }
}