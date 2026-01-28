import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((module) => module.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((module) => module.Login),
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup').then((module) => module.Signup),
  },
  {
    path: 'reset',
    loadComponent: () => import('./auth/forgot-password/forgot-password').then((module) => module.ForgotPassword),
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
    loadComponent: () => import('./pages/profile/profile').then((module) => module.Profile),
  },
];
