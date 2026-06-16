import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, MatCardModule,MatFormFieldModule,MatInputModule,MatButtonModule],
  styleUrl: './auth.scss',
  templateUrl: './auth.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auth {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  protected readonly loginError = signal<string>('');

  form = new FormGroup({
    
    login: new FormControl('',{nonNullable: true,validators: [Validators.required, Validators.minLength(10)]}),
    password: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.minLength(10)]}),
  });

  protected onSubmit(){
    if (this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }
    this.loginError.set('');
    const login = this.form.get('login')?.value ?? '';
    const password = this.form.get('password')?.value ?? '';

    console.log(login, password);
    this.authService.login({login, password}).subscribe((isLoggedIn)=>{
      console.log(isLoggedIn);
      if (isLoggedIn) {
        
        this.router.navigate(['/catalog_products']);
      } 
      else {
        this.loginError.set('Неверный логин или пароль');
        this.form.reset();
      }
    });

  }
}
