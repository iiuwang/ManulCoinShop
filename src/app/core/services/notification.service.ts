import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly translate = inject(TranslateService);
  private readonly snackBar = inject(MatSnackBar);

  showSuccess(key: string): void {
    const message = this.translate.instant(key);
    const action = this.translate.instant('common.close');
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
  showError(key: string): void {
    const message = this.translate.instant(key);
    const action = this.translate.instant('common.close');
    this.snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}