import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Product } from "../models/product.interface";
import { Observable, tap } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ProductService{
    private readonly apiUrl = 'api/products';
    constructor(private http: HttpClient){}
    

    getProducts(): Observable<Product[]>{
        console.log('[API] → GET', this.apiUrl);
        return this.http.get<Product[]>(this.apiUrl).pipe(
            tap((products) => console.log('[API] ← GET', this.apiUrl, products)),
        );
    }

    getProductById(id: number): Observable<Product>{
        const url = `${this.apiUrl}/${id}`;
        console.log('[API] → GET', url);
        return this.http.get<Product>(url).pipe(
            tap((product) => console.log('[API] ← GET', url, product)),
        );
        //return of(this.products.find(product=>product.id === id))
    }
}