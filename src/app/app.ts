import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StorageService, STORAGE_KEYS } from './core/services/storage.service';
import { Footer } from './shared/components/footer/footer';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Footer],
    templateUrl: './app.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
    protected readonly router = inject(Router);
    private readonly storage = inject(StorageService);
    private readonly translate = inject(TranslateService);
    ngOnInit(): void {
        const saved = this.storage.getItem(STORAGE_KEYS.LANG) ?? 'ru';
        this.translate.use(saved);
    }
}
