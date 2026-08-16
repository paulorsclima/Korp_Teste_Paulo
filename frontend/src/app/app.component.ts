import { Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>receipt_long</mat-icon>

      <span style="margin-left: 8px;">
        Sistema de Notas Fiscais - Korp
      </span>

      <span style="flex: 1 1 auto;"></span>

      <button
        mat-button
        routerLink="/products"
        routerLinkActive="active"
      >
        Produtos
      </button>

      <button
        mat-button
        routerLink="/invoices"
        routerLinkActive="active"
      >
        Notas Fiscais
      </button>
    </mat-toolbar>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .active {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class AppComponent {}