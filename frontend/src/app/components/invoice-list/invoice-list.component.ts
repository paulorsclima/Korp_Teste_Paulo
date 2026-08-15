import { Component, OnInit } from '@angular/core';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ApiService, Product, Invoice, InvoiceItem } from '../../services/api.service';

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
    MatDialogModule
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
          <button mat-raised-button color="primary" (click)="createInvoice()" style="margin-bottom: 16px;">
            <mat-icon>add</mat-icon>
            Nova Nota Fiscal
          </button>

          <table mat-table [dataSource]="invoices" class="mat-elevation-z0">
            <ng-container matColumnDef="sequentialNumber">
              <th mat-header-cell *matHeaderCellDef> N\u00famero </th>
              <td mat-cell *matCellDef="let element"> 
                <strong>#{{element.sequentialNumber}}</strong> 
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Status </th>
              <td mat-cell *matCellDef="let element">
                <mat-chip [color]="element.status === 'Aberta' ? 'accent' : 'basic'">
                  <mat-icon style="font-size: 16px; margin-right: 4px;">{{element.status === 'Aberta' ? 'check_circle' : 'done_all'}}</mat-icon>
                  {{element.status}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef> Itens </th>
              <td mat-cell *matCellDef="let element"> 
                <mat-icon style="vertical-align: middle; font-size: 18px;">shopping_cart</mat-icon>
                {{element.items.length}} 
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef> Data </th>
              <td mat-cell *matCellDef="let element"> 
                <mat-icon style="vertical-align: middle; font-size: 18px;">calendar_today</mat-icon>
                {{element.createdAt | date:'dd/MM/yyyy HH:mm'}} 
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> A\u00e7\u00f5es </th>
              <td mat-cell *matCellDef="let element">
                <button mat-icon-button color="primary" (click)="viewInvoice(element)" title="Ver detalhes">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent" (click)="printInvoice(element)" 
                        [disabled]="element.status !== 'Aberta'" title="Imprimir e fechar">
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
    .container { padding: 16px; max-width: 1000px; margin: 0 auto; }
    table { width: 100%; }
    mat-card-header { margin-bottom: 16px; }
  `]
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  products: Product[] = [];
  displayedColumns: string[] = ['sequentialNumber', 'status', 'items', 'createdAt', 'actions'];
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
        this.snackBar.open('Erro ao carregar notas fiscais', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (data) => this.products = data
    });
  }

  createInvoice(): void {
    this.loading = true;
    this.apiService.createInvoice().subscribe({
      next: (invoice) => {
        this.snackBar.open(`Nota fiscal #${invoice.sequentialNumber} criada com sucesso!`, 'Fechar', { duration: 3000 });
        this.loadInvoices();
      },
      error: () => {
        this.snackBar.open('Erro ao criar nota fiscal', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  viewInvoice(invoice: Invoice): void {
    this.snackBar.open(`Visualizar nota #${invoice.sequentialNumber} - ${invoice.items.length} itens`, 'Fechar', { duration: 3000 });
  }

  printInvoice(invoice: Invoice): void {
    if (invoice.status !== 'Aberta') {
      this.snackBar.open('Apenas notas abertas podem ser impressas', 'Fechar', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.apiService.closeInvoice(invoice.id).subscribe({
      next: () => {
        this.snackBar.open('Nota fiscal impressa e fechada com sucesso!', 'Fechar', { duration: 3000 });
        this.loadInvoices();
      },
      error: () => {
        this.snackBar.open('Erro ao imprimir nota fiscal', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
