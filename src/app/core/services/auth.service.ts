import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginData } from '../models/login-data.interface';
import { User } from '../models/user.interface';
import { Observable, BehaviorSubject,  of, tap } from 'rxjs';
import { StorageService, STORAGE_KEYS } from './storage.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly loginUrl = 'api/auth/login';
    private readonly userUrl = 'api/user';
    private readonly storage = inject(StorageService);

    private currentUserSubject = new BehaviorSubject<User | null>(this.getSavedUser());
    public currentUser$ = this.currentUserSubject.asObservable();

    private readonly http = inject(HttpClient);


    private saveUser(user: User): void {
        this.storage.setObject(STORAGE_KEYS.CURRENT_USER, user);
        this.currentUserSubject.next(user);
    }

    private getSavedUser(): User | null {
        return this.storage.getObject<User>(STORAGE_KEYS.CURRENT_USER);
    }

    public login(data: LoginData): Observable<User> {
        return this.http.post<User>(this.loginUrl, data).pipe(
            tap((user) => this.saveUser(user)),
        );
    }

    public getUser(): Observable<User | null> {
        const savedUser = this.getSavedUser();
        if (!savedUser) {
            return of(null);
        }
        const headers = new HttpHeaders({
            'X-User-Id': String(savedUser.id),
        });
        return this.http.get<User>(this.userUrl, { headers }).pipe(
            tap((user) => {
                this.saveUser(user);
            })
        );
    }

    public logout(): void {
        this.storage.removeItem(STORAGE_KEYS.CURRENT_USER);
        this.currentUserSubject.next(null);
    }

    public getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

}
