import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LoginData } from "../models/login-data.interface";
import { User } from "../models/user.interface";
import {Observable, BehaviorSubject} from "rxjs";

type UserWithPassword = User & { password: string };

@Injectable({
    providedIn: 'root',
})
export class AuthService{

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    
    private users: UserWithPassword[] = [
        {
            id: 1,
            login: 'admin',
            password: 'qwerty',
            name: 'Алена',
            balance: 5000
        }

    ]

    public login(data: LoginData): boolean{
        
        const foundUser = this.users.find(user => user.login === data.login && user.password === data.password)

        if(!foundUser){
            return false;
        }

        const user: User ={
            id: foundUser.id,
            name: foundUser.name,
            balance: foundUser.balance,
            login: foundUser.login
        }
        this.currentUserSubject.next(user);

        return true; 
    }

    public logout(): void{
        this.currentUserSubject.next(null);
    }
    
    public getCurrentUser(): User | null{
        return this.currentUserSubject.value;
    }
}