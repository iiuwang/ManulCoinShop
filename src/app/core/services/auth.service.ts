import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginData } from '../models/login-data.interface';
import { RegisterData } from '../models/register-data.interface';
import { TopUpData } from '../models/top-up-data.interface';
import { User } from '../models/user.interface';
import { Observable, BehaviorSubject, of, tap } from 'rxjs';
import { StorageService, STORAGE_KEYS } from './storage.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly loginUrl = 'api/auth/login';
    private readonly registerUrl = 'api/auth/register';
    private readonly userUrl = 'api/user';
    private readonly topUpUrl = 'api/user/top-up';
    private readonly storage = inject(StorageService);

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private readonly http = inject(HttpClient);

    private saveUser(user: User): void {
        this.storage.setItem(STORAGE_KEYS.CURRENT_USER_ID, String(user.id));
        this.currentUserSubject.next(user);
    }

    private getSavedUserId(): number | null {
        const raw = this.storage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
        if (!raw) {
            return null;
        }
        const userId = Number(raw);
        return Number.isFinite(userId) ? userId : null;
    }

    private getAuthHeaders(): HttpHeaders | null {
        const userId = this.getSavedUserId();
        if (!userId) {
            return null;
        }
        return new HttpHeaders({
            'X-User-Id': String(userId),
        });
    }

    public login(data: LoginData): Observable<User> {
        return this.http.post<User>(this.loginUrl, data).pipe(
            tap((user) => this.saveUser(user)),
        );
    }

    public register(data: RegisterData): Observable<User> {
        return this.http.post<User>(this.registerUrl, data).pipe(
            tap((user) => this.saveUser(user)),
        );
    }

    public getUser(): Observable<User | null> {
        const headers = this.getAuthHeaders();
        if (!headers) {
            return of(null);
        }
        return this.http.get<User>(this.userUrl, { headers }).pipe(
            tap((user) => this.saveUser(user)),
        );
    }

    public topUp(amount: number): Observable<User | null> {
        const headers = this.getAuthHeaders();
        if (!headers) {
            return of(null);
        }
        const body: TopUpData = { amount };
        return this.http.post<User>(this.topUpUrl, body, { headers }).pipe(
            tap((user) => this.saveUser(user)),
        );
    }

    public logout(): void {
        this.storage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
        this.currentUserSubject.next(null);
    }

    public hasSession(): boolean {
        return this.getSavedUserId() !== null;
    }

    public getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }
}
