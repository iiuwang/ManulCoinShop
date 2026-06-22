import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LoginData } from "../models/login-data.interface";
import { User } from "../models/user.interface";
import {Observable, BehaviorSubject, map, catchError,of,tap} from "rxjs";


@Injectable({
    providedIn: 'root',
})
export class AuthService{

    private readonly loginUrl = 'api/auth/login';
    private readonly userUrl = 'api/user';

    private currentUserSubject = new BehaviorSubject<User | null>(this.getSavedUser());
    public currentUser$ = this.currentUserSubject.asObservable();
    
    constructor(private readonly http: HttpClient){}

    private balanceKey(userId: number): string {
        return `userBalance_${userId}`;
    }

    private applySavedBalance(user: User): User {
        const savedBalance = localStorage.getItem(this.balanceKey(user.id));
        if (savedBalance === null) {
          return user;
        }
        return { ...user, balance: Number(savedBalance) };
    }

    private saveUser(user: User): void {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem(this.balanceKey(user.id), String(user.balance));
        this.currentUserSubject.next(user);
    }

    private getSavedUser(): User | null {
        const savedUser = localStorage.getItem('currentUser');
      
        if (!savedUser) {
          return null;
        }
      
        return this.applySavedBalance(JSON.parse(savedUser));
    }

    public login(data: LoginData): Observable<boolean>{
        console.log('[API] → POST', this.loginUrl, data);
        return this.http.post<User>(this.loginUrl, data).pipe(
            map((user) =>{
                console.log('[API] ← POST', this.loginUrl, user);
                this.saveUser(this.applySavedBalance(user));
                return true;
            }),
            catchError((error) => {
                console.log('[API] ✗ POST', this.loginUrl, error);
                return of(false);
            }),
        );
    }

    public getUser(): Observable<User | null> {
        const savedUser = this.getSavedUser();
        if (!savedUser) {
          console.log('[API] skip GET', this.userUrl, '(не залогинен)');
          return of(null);
        }
        const headers = new HttpHeaders({
          'X-User-Id': String(savedUser.id),
        });
        console.log('[API] → GET', this.userUrl, { 'X-User-Id': savedUser.id });
        return this.http.get<User>(this.userUrl, { headers }).pipe(
          tap((user) => {
            console.log('[API] ← GET', this.userUrl, user);
            this.saveUser(this.applySavedBalance(user));
          }),
          catchError((error) => {
            console.log('[API] ✗ GET', this.userUrl, error);
            return of(null);
          }),
        );
    }

    public logout(): void{
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
    
    public getCurrentUser(): User | null{
        return this.currentUserSubject.value;
    }

    public updateBalance(newBalance: number): void {
        const user = this.getCurrentUser();
        if (!user) return;
        this.saveUser({ ...user, balance: newBalance });
      }

}