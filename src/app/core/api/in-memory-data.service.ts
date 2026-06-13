import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
    createDb() {
        const products = [
        {
            id: 1,
            name: 'Кружка с манулом',
            price: 150,
            image: 'assets/images/products/selection.png',
        },
        ];

        const orders = [
            {
                id: 1,
                date: '2026-05-21',
                items: [],
                total_price: 0,
                status: 'Сборка',
            },
        ];

        const users = [
            {
              id: 1,
              login: 'admin',
              password: 'qwerty',
              name: 'Алена',
              balance: 5000,
            },
          ];

        return {
            products,
            orders,
            users,
        };
    }
}