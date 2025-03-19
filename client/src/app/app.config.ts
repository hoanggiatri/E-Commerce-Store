import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideZoneChangeDetection,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { InitService } from './core/services/init.service';
import { lastValueFrom } from 'rxjs';
import { authInterceptor } from './core/interceptors/auth.interceptor';

function initializeApp(initService: InitService) {
  const platformId = inject(PLATFORM_ID);

  return () =>
    lastValueFrom(initService.init()).finally(() => {
      if (isPlatformBrowser(platformId)) {
        const splash = document.getElementById('initial-splash');
        if (splash) {
          splash.remove();
        }
      }
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([errorInterceptor, loadingInterceptor, authInterceptor])
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
      deps: [InitService],
    },
  ],
};
