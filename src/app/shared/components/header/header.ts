import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ErrorService } from '../../../core/services/error.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StorageService, STORAGE_KEYS } from '../../../core/services/storage.service';

@Component({
    selector: 'app-header',
    imports: [
        RouterLink,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        TranslatePipe,
        MatButtonToggleModule,
    ],
    templateUrl: './header.html',
    styleUrl: './header.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnInit {
    private readonly storage = inject(StorageService);
    private readonly errorService = inject(ErrorService);
    private readonly notification = inject(NotificationService);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    private readonly translate = inject(TranslateService);

    protected readonly currentUser = toSignal(this.authService.currentUser$, {
        initialValue: null,
    });
    protected readonly currentLang = signal<'ru' | 'en'>('ru');
    protected readonly topUpAmount = new FormControl(500, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1), Validators.max(100000)],
    });

    ngOnInit(): void {
        const lang = this.translate.getCurrentLang() as 'ru' | 'en';
        if (lang === 'ru' || lang === 'en') {
            this.currentLang.set(lang);
        }
        this.authService.getUser().subscribe({
            error: (err) => this.errorService.handle(err),
        });
    }

    protected switchLang(lang: 'ru' | 'en'): void {
        this.storage.setItem(STORAGE_KEYS.LANG, lang);
        this.translate.use(lang);
        this.currentLang.set(lang);
    }

    protected topUp(): void {
        if (this.topUpAmount.invalid) {
            this.topUpAmount.markAsTouched();
            return;
        }
        this.authService.topUp(this.topUpAmount.value).subscribe({
            next: () => this.notification.showSuccess('header.topUpSuccess'),
            error: (err) => this.errorService.handle(err),
        });
    }

    protected logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
