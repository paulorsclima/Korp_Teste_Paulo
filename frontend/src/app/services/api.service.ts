import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  code: string;
  description: string;
  balance: number;
}

export interface Invoice {
  id: number;
  sequentialNumber: number;
  status: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  id: number;
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private stockApiUrl = 'http://localhost:5001/api';
  private invoiceApiUrl = 'http://localhost:5002/api';

  constructor(private http: HttpClient) {}

  // Products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.stockApiUrl}/products`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.stockApiUrl}/products`, product);
  }

  // Invoices
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.invoiceApiUrl}/invoices`);
  }

  createInvoice(): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.invoiceApiUrl}/invoices`, {});
  }

  addInvoiceItem(invoiceId: number, item: InvoiceItem): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.invoiceApiUrl}/invoices/${invoiceId}/items`, item);
  }

  closeInvoice(invoiceId: number): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.invoiceApiUrl}/invoices/${invoiceId}/close`, {});
  }
}
