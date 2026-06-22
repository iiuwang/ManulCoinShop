import { Component, signal,inject,OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected readonly title = signal('manul-coin-shop');
  private readonly translate = inject(TranslateService);
  ngOnInit(): void {
    const saved = localStorage.getItem('lang') ?? 'ru';
    this.translate.use(saved);
  }
}
