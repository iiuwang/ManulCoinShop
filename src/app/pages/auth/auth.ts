import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
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

    protected readonly form = new FormGroup({
        login: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(10)],
        }),
        password: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(10)],
        }),
    });

    protected onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const login = this.form.controls.login.value;
        const password = this.form.controls.password.value;

        const request$ = this.authService.login({ login, password });

        request$.subscribe({
            next: () => {
                this.router.navigate(['/catalog_products']);
            },
            error: (err) => {
                this.errorService.handle(err);
                this.form.controls.password.reset();
            },
        });
    }
}
