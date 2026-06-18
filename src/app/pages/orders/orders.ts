import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Header } from '../../shared/components/header/header';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.interface';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-orders',
  imports: [Header, RouterLink, MatIconModule, DecimalPipe, MatButtonModule, MatCardModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders {
  private readonly orderService = inject(OrderService);
  protected readonly orders = toSignal(this.orderService.getOrders(),{initialValue: []});
  protected readonly expandedOrderId = signal<number | null>(null);

  protected  itemsCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  protected toggleOrder(id: number): void {
    if (this.expandedOrderId() === id) {
      this.expandedOrderId.set(null);
    } else {
      this.expandedOrderId.set(id);
    }
  }

  activeFilter = signal<'all' | 'Сборка' | 'В пути' | 'Выдан'>('all');
  protected readonly filteredOrders = computed(() =>{
    const all = this.orders();
    if(this.activeFilter() ==='all'){
      return all;
    }
    return all.filter(order => order.status === this.activeFilter());
  });

  protected readonly filters = computed(() => {
    const all = this.orders();
    return [
      { id: 'all' as const,    label: 'Все заказы', count: all.length },
      { id: 'Сборка' as const, label: 'Сборка',     count: all.filter(o => o.status === 'Сборка').length },
      { id: 'В пути' as const, label: 'В пути',     count: all.filter(o => o.status === 'В пути').length },
      { id: 'Выдан' as const,  label: 'Выдан',      count: all.filter(o => o.status === 'Выдан').length },
    ];
  });
    
}
