import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ErrorService } from '../../core/services/error.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-auth',
    imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        TranslatePipe,
    ],
    styleUrl: './auth.scss',
    templateUrl: './auth.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auth {
    private readonly errorService = inject(ErrorService);
    private readonly notification = inject(NotificationService);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    protected readonly mode = signal<'login' | 'register'>('login');
    protected readonly isRegisterMode = computed(() => this.mode() === 'register');

    protected readonly form = new FormGroup({
        name: new FormControl('', {
            nonNullable: true,
            validators: [Validators.minLength(2)],
        }),
        login: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(3)],
        }),
        password: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(6)],
        }),
    });

    protected switchMode(mode: 'login' | 'register'): void {
        this.mode.set(mode);
        this.form.reset();
    }

    protected onSubmit(): void {
        if (this.isRegisterMode()) {
            this.form.controls.name.addValidators(Validators.required);
        } else {
            this.form.controls.name.removeValidators(Validators.required);
        }
        this.form.controls.name.updateValueAndValidity();

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const login = this.form.controls.login.value;
        const password = this.form.controls.password.value;
        const name = this.form.controls.name.value;

        const request$ = this.isRegisterMode()
            ? this.authService.register({ name, login, password })
            : this.authService.login({ login, password });

        request$.subscribe({
            next: () => {
                this.notification.showSuccess(
                    this.isRegisterMode() ? 'auth.registerSuccess' : 'auth.loginSuccess',
                );
                this.router.navigate(['/catalog_products']);
            },
            error: (err) => {
                this.errorService.handle(err);
                this.form.controls.password.reset();
            },
        });
    }
}
