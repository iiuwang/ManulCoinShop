import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LoginData } from "../models/login-data.interface";
import { User } from "../models/user.interface";

@Injectable({
    providedIn: 'root',
})
export class AuthService{
    private users: User[] = [
        {
            id: 1,
            login: 'admin',
            name: 'Алена',
            balance: 5000
        }

    ]

    public login(data: LoginData): void{

        //login = this.users.find(user => user.login === 'admin')
    }
}