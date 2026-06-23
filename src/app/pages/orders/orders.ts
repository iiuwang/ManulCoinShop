import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Header } from '../../shared/components/header/header';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../core/models/order.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-orders',
    imports: [
        Header,
        RouterLink,
        MatIconModule,
        DecimalPipe,
        MatButtonModule,
        MatCardModule,
        TranslatePipe,
        MatProgressSpinnerModule,
    ],
    templateUrl: './orders.html',
    styleUrl: './orders.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Orders {
    private readonly orderService = inject(OrderService);

    protected readonly expandedOrderId = signal<number | null>(null);
    protected readonly isLoading = signal(true);
    protected readonly activeFilter = signal<'all' | OrderStatus>('all');
    protected readonly orders = toSignal(
        this.orderService.getOrders().pipe(finalize(() => this.isLoading.set(false))),
        { initialValue: [] },
    );

    protected readonly filteredOrders = computed(() => {
        const all = this.orders();
        return this.activeFilter() === 'all' ? all : all.filter((order) => order.status === this.activeFilter());
    });

    protected readonly filters = computed(() => {
        const all = this.orders();
        return [
            { id: 'all' as const, labelKey: 'orders.allOrders', count: all.length },
            {
                id: OrderStatus.Assembly,
                labelKey: 'orders.assembly',
                count: all.filter((o) => o.status === OrderStatus.Assembly).length,
            },
            {
                id: OrderStatus.InTransit,
                labelKey: 'orders.in_transit',
                count: all.filter((o) => o.status === OrderStatus.InTransit).length,
            },
            {
                id: OrderStatus.Completed,
                labelKey: 'orders.completed',
                count: all.filter((o) => o.status === OrderStatus.Completed).length,
            },
        ];
    });


    protected getItemsCount(order: Order): number {
        return order.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    protected toggleOrder(id: number): void {
        this.expandedOrderId.set(this.expandedOrderId() === id ? null : id);
    }


    protected getStatusTranslationKey(status: OrderStatus): string {
        switch (status) {
            case OrderStatus.Assembly:
                return 'orders.assembly';
            case OrderStatus.InTransit:
                return 'orders.in_transit';
            case OrderStatus.Completed:
                return 'orders.completed';
        }
    }

}
