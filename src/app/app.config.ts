import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
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
    ],
};
