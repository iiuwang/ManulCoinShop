import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
@Component({
    selector: 'app-header',
    imports: [RouterLink, MatIconModule, MatButtonModule, TranslatePipe, MatButtonToggleModule],
    templateUrl: './header.html',
    styleUrl: './header.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnInit {

    ngOnInit(): void {
        const lang = this.translate.getCurrentLang() as 'ru' | 'en';
        if (lang === 'ru' || lang === 'en') {
            this.currentLang.set(lang);
        }
        this.authService.getUser().subscribe();
    }
    
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    protected readonly currentUser = toSignal(this.authService.currentUser$, {
        initialValue: null,
    });
    private readonly translate = inject(TranslateService);
    protected readonly currentLang = signal<'ru' | 'en'>('ru');


    protected switchLang(lang: 'ru' | 'en'): void {
        localStorage.setItem('lang', lang);
        this.translate.use(lang);
        this.currentLang.set(lang);
    }

    protected logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
