import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginData } from '../models/login-data.interface';
import { User } from '../models/user.interface';
import { Observable, BehaviorSubject, of, tap } from 'rxjs';
import { StorageService, STORAGE_KEYS } from './storage.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly loginUrl = 'api/auth/login';
    private readonly userUrl = 'api/user';
    private readonly storage = inject(StorageService);

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private readonly http = inject(HttpClient);

    private saveUser(user: User): void {
        if (user.token) {
            this.storage.setItem(STORAGE_KEYS.CURRENT_USER_TOKEN, user.token);
        }

        const { token, ...userWithoutToken } = user;
        this.currentUserSubject.next(userWithoutToken);
    }

    private getSavedToken(): string | null {
        return this.storage.getItem(STORAGE_KEYS.CURRENT_USER_TOKEN);
    }

    public getAuthHeaders(): HttpHeaders | null {
        const token = this.getSavedToken();
        if (!token) {
            return null;
        }
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    public login(data: LoginData): Observable<User> {
        return this.http.post<User>(this.loginUrl, data).pipe(
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

    public logout(): void {
        this.storage.removeItem(STORAGE_KEYS.CURRENT_USER_TOKEN);
        this.currentUserSubject.next(null);
    }

    public hasSession(): boolean {
        return this.getSavedToken() !== null;
    }

    public getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }
}
