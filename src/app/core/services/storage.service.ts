import { Injectable } from '@angular/core';

const STORAGE_KEYS = {
    CURRENT_USER: 'currentUser',
    CART_ITEMS: 'cartItems',
    ORDERS: 'orders',
    LANG: 'lang',
} as const;

@Injectable({
    providedIn: 'root',
})
export class StorageService {

    getItem(key: string): string | null {
        return localStorage.getItem(key);
    }

    setItem(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }

    getObject<T>(key: string): T | null {
        const raw = this.getItem(key);
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    }

    setObject<T>(key: string, value: T): void {
        this.setItem(key, JSON.stringify(value));
    }
}

export { STORAGE_KEYS };