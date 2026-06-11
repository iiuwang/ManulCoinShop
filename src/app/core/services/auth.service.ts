import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LoginData } from "../models/login-data.interface";
import { User } from "../models/user.interface";

type UserWithPassword = User & { password: string };

@Injectable({
    providedIn: 'root',
})
export class AuthService{

    //currentUser
    
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
        
        const login = this.users.find(user => user.login === data.login && user.password === data.password)

        if(!login){
            return false;
        }

        return true;
        
    }
}