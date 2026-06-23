import { Injectable, inject } from '@angular/core';
import {
    InMemoryDbService,
    RequestInfo,
    ResponseOptions,
    STATUS,
    getStatusText,
} from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';
import { Order } from '../models/order.interface';
import { HttpRequest } from '@angular/common/http';
import { STORAGE_KEYS, StorageService } from '../services/storage.service';

@Injectable({
    providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
    
    private readonly storage = inject(StorageService);
    private nextOrderId = 1;
    createDb() {
        const saved = this.storage.getObject<Order[]>(STORAGE_KEYS.ORDERS) ?? [];
        this.nextOrderId = saved.reduce((max, o) => Math.max(max, o.id), 0) + 1;
        const products = [
            {
                id: 1,
                name: 'products.mug1',
                price: 150,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 2,
                name: 'products.mug2',
                price: 160,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 3,
                name: 'products.mug3',
                price: 200,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 4,
                name: 'products.mug4',
                price: 100,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 5,
                name: 'products.mug5',
                price: 340,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 6,
                name: 'products.mug6',
                price: 3400,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 7,
                name: 'products.mug7',
                price: 40,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 8,
                name: 'products.mug8',
                price: 940,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 9,
                name: 'products.mug9',
                price: 140,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 10,
                name: 'products.mug10',
                price: 1400,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 11,
                name: 'products.mug11',
                price: 1400,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 12,
                name: 'products.mug12',
                price: 450,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 13,
                name: 'products.mug13',
                price: 140,
                image: 'assets/images/products/selection.png',
            },
            {
                id: 14,
                name: 'products.mug14',
                price: 390,
                image: 'assets/images/products/selection.png',
            },
        ];

        const orders: Order[] = [];

        const users: Array<User & { password: string }> = [
            {
                id: 1,
                login: 'adminadmin',
                password: 'qwerty1234',
                name: 'Алена',
                balance: 5000,
            },
        ];

        return { products, orders, users };
    }

    get(reqInfo: RequestInfo): Observable<unknown> | undefined {
        if (reqInfo.collectionName === 'user') {
            return this.getUser(reqInfo);
        }
        return undefined;
    }

    post(reqInfo: RequestInfo): Observable<unknown> | undefined {
        if (reqInfo.collectionName === 'auth' && reqInfo.id === 'login') {
            return this.login(reqInfo);
        }
        if (reqInfo.collectionName === 'order') {
            return this.createOrder(reqInfo);
        }
        return undefined;
    }

    private getUser(reqInfo: RequestInfo) {
        return reqInfo.utils.createResponse$(() => {
            const userId = (reqInfo.req as HttpRequest<unknown>).headers.get('X-User-Id');

            if (!userId) {
                return this.finishOptions(
                    { status: STATUS.UNAUTHORIZED, body: { error: 'UNAUTHORIZED' } },
                    reqInfo,
                );
            }

            const db = reqInfo.utils.getDb() as { users: User[] };
            const foundUser = db.users.find((user) => user.id === Number(userId));

            if (!foundUser) {
                return this.finishOptions(
                    { status: STATUS.NOT_FOUND, body: { error: 'USER_NOT_FOUND' } },
                    reqInfo,
                );
            }

            const user: User = {
                id: foundUser.id,
                name: foundUser.name,
                balance: foundUser.balance,
                login: foundUser.login,
            };

            return this.finishOptions({ status: STATUS.OK, body: user }, reqInfo);
        });
    }

    private login(reqInfo: RequestInfo) {
        return reqInfo.utils.createResponse$(() => {
            const body = reqInfo.utils.getJsonBody(reqInfo.req) as {
                login: string;
                password: string;
            };
            const db = reqInfo.utils.getDb() as { users: Array<User & { password: string }> };
            const foundUser = db.users.find(
                (user) => user.login === body.login && user.password === body.password,
            );
            if (!foundUser) {
                return this.finishOptions(
                    {
                        status: STATUS.UNAUTHORIZED,
                        body: { error: 'INVALID_CREDENTIALS' },
                    },
                    reqInfo,
                );
            }
            const user: User = {
                id: foundUser.id,
                name: foundUser.name,
                balance: foundUser.balance,
                login: foundUser.login,
            };
            return this.finishOptions({ status: STATUS.OK, body: user }, reqInfo);
        });
    }

    private createOrder(reqInfo: RequestInfo) {
        return reqInfo.utils.createResponse$(() => {
            const db = reqInfo.utils.getDb() as {
                orders: Order[];
                users: Array<User & { password: string }>;
            };
            const userId = (reqInfo.req as HttpRequest<unknown>).headers.get('X-User-Id');
            if (!userId) {
                return this.finishOptions(
                    { status: STATUS.UNAUTHORIZED, body: { error: 'UNAUTHORIZED' } },
                    reqInfo,
                );
            }
            const foundUser = db.users.find((user) => user.id === Number(userId));
            if (!foundUser) {
                return this.finishOptions(
                    { status: STATUS.NOT_FOUND, body: { error: 'USER_NOT_FOUND' } },
                    reqInfo,
                );
            }
            const newOrder = reqInfo.utils.getJsonBody(reqInfo.req) as Omit<Order, 'id'>;
            const totalPrice = newOrder.total_price;
            if (foundUser.balance < totalPrice) {
                return this.finishOptions(
                    {
                        status: STATUS.BAD_REQUEST,
                        body: { error: 'INSUFFICIENT_FUNDS' },
                    },
                    reqInfo,
                );
            }
            foundUser.balance -= totalPrice;
            const order: Order = {
                ...newOrder,
                id: this.nextOrderId++,
            };
            db.orders.push(order);
            return this.finishOptions({ status: STATUS.CREATED, body: order }, reqInfo);
        });
    }

    
    private finishOptions(options: ResponseOptions, reqInfo: RequestInfo): ResponseOptions {
        options.statusText = getStatusText(options.status ?? STATUS.OK);
        options.headers = reqInfo.headers;
        options.url = reqInfo.url;
        return options;
    }
}
