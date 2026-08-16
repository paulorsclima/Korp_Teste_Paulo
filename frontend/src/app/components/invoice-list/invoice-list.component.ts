import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import {
  ApiService,
  Product,
  Invoice,
  InvoiceItem
} from '../../services/api.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>receipt</mat-icon>
            Notas Fiscais
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <button
            mat-raised-button
            color="primary"
            (click)="createInvoice()"
            style="margin-bottom: 16px;"
          >
            <mat-icon>add</mat-icon>
            Nova Nota Fiscal
          </button>

          <table mat-table [dataSource]="invoices" class="mat-elevation-z0">
            <ng-container matColumnDef="sequentialNumber">
              <th mat-header-cell *matHeaderCellDef>Número</th>
              <td mat-cell *matCellDef="let element">
                <strong>#{{ element.sequentialNumber }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let element">
                <mat-chip [color]="element.status === 'Aberta' ? 'accent' : 'basic'">
                  <mat-icon style="font-size: 16px; margin-right: 4px;">
                    {{ element.status === 'Aberta' ? 'check_circle' : 'done_all' }}
                  </mat-icon>
                  {{ element.status }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef>Itens</th>
              <td mat-cell *matCellDef="let element">
                <mat-icon style="vertical-align: middle; font-size: 18px;">
                  shopping_cart
                </mat-icon>
                {{ element.items.length }}
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Data</th>
              <td mat-cell *matCellDef="let element">
                <mat-icon style="vertical-align: middle; font-size: 18px;">
                  calendar_today
                </mat-icon>
                {{ element.createdAt | date:'dd/MM/yyyy HH:mm' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Ações</th>
              <td mat-cell *matCellDef="let element">
                <button
                  mat-icon-button
                  color="primary"
                  (click)="viewInvoice(element)"
                  title="Adicionar produto à nota"
                  [disabled]="element.status !== 'Aberta'"
                >
                  <mat-icon>visibility</mat-icon>
                </button>

                <button
                  mat-icon-button
                  color="accent"
                  (click)="printInvoice(element)"
                  [disabled]="element.status !== 'Aberta'"
                  title="Imprimir e fechar"
                >
                  <mat-icon>print</mat-icon>
                </button>
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
    .container {
      padding: 16px;
      max-width: 1000px;
      margin: 0 auto;
    }

    table {
      width: 100%;
    }

    mat-card-header {
      margin-bottom: 16px;
    }
  `]
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  products: Product[] = [];

  displayedColumns: string[] = [
    'sequentialNumber',
    'status',
    'items',
    'createdAt',
    'actions'
  ];

  loading = false;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadProducts();
  }

  loadInvoices(): void {
    this.loading = true;

    this.apiService.getInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open(
          'Erro ao carregar notas fiscais',
          'Fechar',
          { duration: 3000 }
        );
        this.loading = false;
      }
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: () => {
        this.snackBar.open(
          'Erro ao carregar produtos disponíveis',
          'Fechar',
          { duration: 3000 }
        );
      }
    });
  }

  createInvoice(): void {
    this.loading = true;

    this.apiService.createInvoice().subscribe({
      next: (invoice) => {
        this.snackBar.open(
          `Nota fiscal #${invoice.sequentialNumber} criada com sucesso!`,
          'Fechar',
          { duration: 3000 }
        );
        this.loadInvoices();
      },
      error: () => {
        this.snackBar.open(
          'Erro ao criar nota fiscal',
          'Fechar',
          { duration: 3000 }
        );
        this.loading = false;
      }
    });
  }

  viewInvoice(invoice: Invoice): void {
    if (invoice.status !== 'Aberta') {
      this.snackBar.open(
        'Não é possível adicionar produtos em uma nota fechada',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }

    if (this.products.length === 0) {
      this.snackBar.open(
        'Nenhum produto disponível para adicionar',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }

    const dialogRef = this.dialog.open(AddInvoiceItemDialogComponent, {
      width: '420px',
      data: {
        products: this.products
      }
    });

    dialogRef.afterClosed().subscribe((item: InvoiceItem | undefined) => {
      if (!item) {
        return;
      }

      this.loading = true;

      this.apiService.addInvoiceItem(invoice.id, item).subscribe({
        next: () => {
          this.snackBar.open(
            'Produto adicionado à nota fiscal com sucesso!',
            'Fechar',
            { duration: 3000 }
          );
          this.loadInvoices();
        },
        error: () => {
          this.snackBar.open(
            'Erro ao adicionar produto à nota fiscal',
            'Fechar',
            { duration: 3000 }
          );
          this.loading = false;
        }
      });
    });
  }

  printInvoice(invoice: Invoice): void {
    if (invoice.status !== 'Aberta') {
      this.snackBar.open(
        'Apenas notas abertas podem ser impressas',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }

    if (invoice.items.length === 0) {
      this.snackBar.open(
        'Adicione pelo menos um produto antes de imprimir a nota',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }

    this.loading = true;

    this.apiService.closeInvoice(invoice.id).subscribe({
      next: () => {
        this.snackBar.open(
          'Nota fiscal impressa e fechada com sucesso!',
          'Fechar',
          { duration: 3000 }
        );
        this.loadInvoices();
      },
      error: () => {
        this.snackBar.open(
          'Erro ao imprimir nota fiscal',
          'Fechar',
          { duration: 3000 }
        );
        this.loading = false;
      }
    });
  }
}

@Component({
  selector: 'app-add-invoice-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Adicionar produto à nota</h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" style="width: 100%;">
        <mat-label>Produto</mat-label>

        <mat-select [(ngModel)]="productId">
          <mat-option
            *ngFor="let product of data.products"
            [value]="product.id"
          >
            {{ product.code }} — {{ product.description }}
            (saldo disponível: {{ product.balance }})
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="width: 100%;">
        <mat-label>Quantidade</mat-label>

        <input
          matInput
          type="number"
          min="1"
          [(ngModel)]="quantity"
        />
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>
        Cancelar
      </button>

      <button
        mat-raised-button
        color="primary"
        (click)="addItem()"
        [disabled]="productId === null || quantity < 1"
      >
        Adicionar produto
      </button>
    </mat-dialog-actions>
  `
})
export class AddInvoiceItemDialogComponent {
  productId: number | null = null;
  quantity = 1;

  constructor(
    private dialogRef: MatDialogRef<AddInvoiceItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      products: Product[];
    }
  ) {}

  addItem(): void {
    if (this.productId === null || this.quantity < 1) {
      return;
    }

    this.dialogRef.close({
      id: 0,
      productId: this.productId,
      quantity: this.quantity
    });
  }
}