import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Product } from "../models/product.interface";
import { Observable} from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ProductService{
    private readonly apiUrl = 'api/products';
    constructor(private http: HttpClient){}
    

    getProducts(): Observable<Product[]>{
        return  this.http.get<Product[]>(this.apiUrl);
    }

    getProductById(id: number): Observable<Product>{
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
        //return of(this.products.find(product=>product.id === id))
    }
}