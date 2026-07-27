import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home.page').then((m) => m.HomePage),
    title: 'ngx-spartan-color-picker',
  },
  {
    path: 'examples',
    loadComponent: () => import('./examples.page').then((m) => m.ExamplesPage),
    title: 'Examples · ngx-spartan-color-picker',
  },
  {
    path: 'api',
    loadComponent: () => import('./api.page').then((m) => m.ApiPage),
    title: 'API · ngx-spartan-color-picker',
  },
  {
    path: 'playground',
    loadComponent: () => import('./playground.page').then((m) => m.PlaygroundPage),
    title: 'Playground · ngx-spartan-color-picker',
  },
  { path: '**', redirectTo: '' },
];
