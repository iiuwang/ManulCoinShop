import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.interface';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    private readonly apiUrl = 'api/products';
    private readonly http = inject(HttpClient);

    public getProducts(): Observable<Product[]> {
        console.log('[API] → GET', this.apiUrl);
        return this.http
            .get<Product[]>(this.apiUrl)
            .pipe(tap((products) => console.log('[API] ← GET', this.apiUrl, products)));
    }
}
