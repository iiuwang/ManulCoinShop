import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StorageService, STORAGE_KEYS } from './core/services/storage.service';
@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
    private readonly storage = inject(StorageService);
    private readonly translate = inject(TranslateService);
    ngOnInit(): void {
        const saved = this.storage.getItem(STORAGE_KEYS.LANG) ?? 'ru';
        this.translate.use(saved);
    }
}
