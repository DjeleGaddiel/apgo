import { Route } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { Home } from './home';

export const homeRoutes: Route[] = [
  {
    path: '',
    component: Home,
    providers: [provideTranslocoScope('home')],
  },
];
