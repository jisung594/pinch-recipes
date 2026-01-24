import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    // Lazy loads the Home component
    loadComponent: () => import('./pages/home/home').then((module) => module.Home),
  },
  {
    path: 'login',
    // Lazy loads the Login component
    loadComponent: () => import('./auth/login/login').then((module) => module.Login),
  },
  {
    path: 'recipes/new',
    loadComponent: () =>
      import('./pages/recipe-editor/recipe-editor').then((module) => module.RecipeEditor),
  },
  {
    path: 'recipes/:id',
    loadComponent: () =>
      import('./pages/recipe-detail/recipe-detail').then((module) => module.RecipeDetail),
  },
  {
    path: 'profile',
    // Lazy loads the Profile component
    loadComponent: () => import('./pages/profile/profile').then((module) => module.Profile),
  },
];
