import { Injectable } from "@angular/core";
import { Product } from "../models/product.interface";
import { Observable,  of } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ProductService{
    
    private products: Product[] = [
        {
            id: 1,
            name: 'Product 1',
            price: 1000,
            image: 'что-то'
        }
    ]

    getProducts(): Observable<Product[]>{
        return of(this.products)
    }

    getProductById(id: number): Observable<Product | undefined>{
        return of(this.products.find(product=>product.id === id))
    }
}