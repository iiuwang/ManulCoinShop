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
        {
            id: 2,
            name: 'Кружка с манулом 2',
            price: 160,
            image: 'assets/images/products/selection.png',
        },
        {
            id: 3,
            name: 'Кружка с манулом 3',
            price: 200,
            image: 'assets/images/products/selection.png',
        },
        {
            id: 4,
            name: 'Кружка с манулом 4',
            price: 100,
            image: 'assets/images/products/selection.png',
        },
        {
            id: 5,
            name: 'Кружка с манулом 5',
            price: 340,
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
              login: 'adminadmin',
              password: 'qwerty1234',
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