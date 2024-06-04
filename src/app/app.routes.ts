import { Routes } from '@angular/router';
import { EditorComponent } from './editor/editor.component';

export const routes: Routes = [
  {
    path: '',
    component: EditorComponent,
  },
  {
    path: '**',
    loadComponent: () => import('./error-page/error.component').then(x => x.ErrorComponent),
  },
];
