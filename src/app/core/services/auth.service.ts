import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { LoginData } from "../models/login-data.interface";
import { User } from "../models/user.interface";
import {Observable, BehaviorSubject, map} from "rxjs";

type UserWithPassword = User & { password: string };

@Injectable({
    providedIn: 'root',
})
export class AuthService{

    private readonly apiUrl = 'api/users';

    private currentUserSubject = new BehaviorSubject<User | null>(this.getSavedUser());
    public currentUser$ = this.currentUserSubject.asObservable();
    
    constructor(private readonly http: HttpClient){}

    private getSavedUser(): User | null {
        const savedUser = localStorage.getItem('currentUser');
      
        if (!savedUser) {
          return null;
        }
      
        return JSON.parse(savedUser);
      }

    public login(data: LoginData): Observable<boolean>{

        const params = new HttpParams().set('login', data.login).set('password', data.password);

        return this.http.get<UserWithPassword[]>(this.apiUrl, {params}).pipe(
            map(users =>{
                const foundUser = users[0];

                if(!foundUser){
                    return false;
                }

                const user: User ={
                    id: foundUser.id,
                    name: foundUser.name,
                    balance: foundUser.balance,
                    login: foundUser.login
                }
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
        
                return true; 
            })
        )
        
        //const foundUser = this.users.find(user => user.login === data.login && user.password === data.password)

        
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
      
        const updatedUser = { ...user, balance: newBalance };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      }

}