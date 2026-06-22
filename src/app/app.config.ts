import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import { routes } from './app.routes';
import { InMemoryDataService } from './core/api/in-memory-data.service';
import {provideTranslateService} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorIntlService } from './core/services/paginator-intl.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/locale/',
        suffix: '.json',
      }),
      fallbackLang: 'ru',
      lang: 'ru',
    }),
    { provide: MatPaginatorIntl, useClass: PaginatorIntlService },
    provideRouter(routes),
    importProvidersFrom(
      HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
        delay: 700,
        dataEncapsulation: false,
        passThruUnknownUrl: true,
      })
    ),
  ],
};