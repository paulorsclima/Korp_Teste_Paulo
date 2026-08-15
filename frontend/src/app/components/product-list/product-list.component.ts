import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ApiService, Product } from '../../services/api.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>add_circle</mat-icon>
            Cadastro de Produtos
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="createProduct()">
            <mat-form-field appearance="outline">
              <mat-label>C\u00f3digo</mat-label>
              <input matInput [(ngModel)]="newProduct.code" name="code" placeholder="Ex: PROD001" required>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Descri\u00e7\u00e3o</mat-label>
              <input matInput [(ngModel)]="newProduct.description" name="description" placeholder="Ex: Produto Teste" required>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Saldo</mat-label>
              <input matInput type="number" [(ngModel)]="newProduct.balance" name="balance" placeholder="Ex: 100" required>
            </mat-form-field>
            
            <button mat-raised-button color="primary" type="submit" [disabled]="loading">
              <mat-spinner *ngIf="loading" diameter="20" style="margin-right: 8px;"></mat-spinner>
              <mat-icon *ngIf="!loading">save</mat-icon>
              Cadastrar
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>inventory_2</mat-icon>
            Produtos Cadastrados
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="products" class="mat-elevation-z0">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef> C\u00f3digo </th>
              <td mat-cell *matCellDef="let element"> <strong>{{element.code}}</strong> </td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef> Descri\u00e7\u00e3o </th>
              <td mat-cell *matCellDef="let element"> {{element.description}} </td>
            </ng-container>

            <ng-container matColumnDef="balance">
              <th mat-header-cell *matHeaderCellDef> Saldo </th>
              <td mat-cell *matCellDef="let element"> 
                <span [style.color]="element.balance < 10 ? 'orange' : 'green'">
                  <mat-icon style="vertical-align: middle; font-size: 18px;">package</mat-icon>
                  {{element.balance}}
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { padding: 16px; max-width: 900px; margin: 0 auto; }
    mat-form-field { width: 250px; }
    table { width: 100%; }
    mat-card-header { margin-bottom: 16px; }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  newProduct: Product = { id: 0, code: '', description: '', balance: 0 };
  displayedColumns: string[] = ['code', 'description', 'balance'];
  loading = false;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar produtos', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  createProduct(): void {
    if (!this.newProduct.code || !this.newProduct.description || !this.newProduct.balance) {
      this.snackBar.open('Preencha todos os campos', 'Fechar', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.apiService.createProduct(this.newProduct).subscribe({
      next: () => {
        this.snackBar.open('Produto cadastrado com sucesso!', 'Fechar', { duration: 3000 });
        this.newProduct = { id: 0, code: '', description: '', balance: 0 };
        this.loadProducts();
      },
      error: () => {
        this.snackBar.open('Erro ao cadastrar produto', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
