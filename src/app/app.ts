import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
    private readonly translate = inject(TranslateService);
    ngOnInit(): void {
        const saved = localStorage.getItem('lang') ?? 'ru';
        this.translate.use(saved);
    }
}
