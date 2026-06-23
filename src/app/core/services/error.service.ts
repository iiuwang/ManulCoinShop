import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root',
})
export class ErrorService {
    private readonly notification = inject(NotificationService);

    public handle(error: unknown): void {
        const translationKey = this.getTranslationKey(error);
        this.notification.showError(translationKey);
    }

    private getTranslationKey(error: unknown): string {
        const code = this.getErrorCode(error);
        switch (code) {
            case 'INVALID_CREDENTIALS':
                return 'errors.invalidCredentials';
            case 'UNAUTHORIZED':
                return 'errors.unauthorized';
            case 'USER_NOT_FOUND':
                return 'errors.userNotFound';
            case 'LOGIN_ALREADY_EXISTS':
                return 'errors.loginAlreadyExists';
            case 'PRODUCT_NOT_FOUND':
                return 'errors.productNotFound';
            case 'EMPTY_ORDER':
                return 'errors.emptyOrder';
            case 'INSUFFICIENT_FUNDS':
                return 'errors.insufficientFunds';
            default:
                return 'errors.unknown';
        }
    }

    private getErrorCode(error: unknown): string | undefined {
        if (error instanceof HttpErrorResponse) {
            const body = error.error;
            if (body && typeof body === 'object') {
                if ('error' in body) {
                    return (body as { error: string }).error;
                }
                if ('detail' in body) {
                    const detail = (body as { detail: unknown }).detail;
                    if (detail && typeof detail === 'object' && 'error' in detail) {
                        return (detail as { error: string }).error;
                    }
                }
            }
            return undefined;
        }

        return undefined;
    }
}
