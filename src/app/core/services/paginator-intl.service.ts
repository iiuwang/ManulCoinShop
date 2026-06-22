import { Injectable, inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class PaginatorIntlService extends MatPaginatorIntl {
    private readonly translate = inject(TranslateService);

    constructor() {
        super();

        this.translate.onLangChange.subscribe(() => this.updateLabels());
        this.updateLabels();
    }

    private updateLabels(): void {
        this.itemsPerPageLabel = this.translate.instant('paginator.itemsPerPage');
        this.nextPageLabel = this.translate.instant('paginator.next');
        this.previousPageLabel = this.translate.instant('paginator.prev');
        this.firstPageLabel = this.translate.instant('paginator.first');
        this.lastPageLabel = this.translate.instant('paginator.last');

        this.getRangeLabel = (page: number, pageSize: number, length: number): string => {
            if (length === 0 || pageSize === 0) {
                return `0 / ${length}`;
            }

            const start = page * pageSize + 1;
            const end = Math.min((page + 1) * pageSize, length);

            return this.translate.instant('paginator.range', {
                start,
                end,
                total: length,
            });
        };

        this.changes.next();
    }
}
