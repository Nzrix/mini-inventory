import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockTransactionService } from '../services/stock-transaction.service';
import { ProductService } from '../services/product.service';
import { StockTransaction } from '../models/stock-transaction.model';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-stock-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="header">
        <h1>Stock Transactions / การเคลื่อนไหวสต็อก</h1>
        <button (click)="showForm = true" class="btn-primary">+ New Transaction</button>
      </div>
      
      <div *ngIf="showForm" class="modal">
        <div class="modal-content">
          <h2>New Stock Transaction</h2>
          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Product *</label>
              <select [(ngModel)]="transaction.productId" name="productId" required class="form-control">
                <option value="">Select Product</option>
                <option *ngFor="let p of products" [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
              </select>
            </div>
            <div class="form-group">
              <label>Type *</label>
              <select [(ngModel)]="transaction.type" name="type" required class="form-control">
                <option value="IN">Stock IN</option>
                <option value="OUT">Stock OUT</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </div>
            <div class="form-group">
              <label>Quantity *</label>
              <input type="number" [(ngModel)]="transaction.quantity" name="quantity" required class="form-control">
              <small *ngIf="transaction.type === 'ADJUSTMENT'">Use negative for reduction</small>
            </div>
            <div class="form-group">
              <label>Reason *</label>
              <textarea [(ngModel)]="transaction.reason" name="reason" required class="form-control" rows="3"></textarea>
            </div>
            <div *ngIf="errorMsg" class="error">{{ errorMsg }}</div>
            <div class="form-actions">
              <button type="button" (click)="showForm = false" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="filter">
        <label>Filter by Product:</label>
        <select [(ngModel)]="filterProductId" (change)="loadTransactions()" class="form-control">
          <option [value]="null">All Products</option>
          <option *ngFor="let p of products" [value]="p.id">{{ p.name }}</option>
        </select>
      </div>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Balance After</th>
            <th>Reason</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of transactions">
            <td>{{ t.createdAt | date:'short' }}</td>
            <td>{{ t.productName }}</td>
            <td><span [class]="'badge-' + t.type.toLowerCase()">{{ t.type }}</span></td>
            <td>{{ t.quantity }}</td>
            <td>{{ t.balanceAfter }}</td>
            <td>{{ t.reason }}</td>
            <td>{{ t.userName }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; }
    .header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
    .filter { margin-bottom: 1rem; }
    .filter label { margin-right: 1rem; }
    .filter select { padding: 0.5rem; }
    .data-table { width: 100%; border-collapse: collapse; background: white; }
    .data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
    .data-table th { background: #f8f9fa; font-weight: 600; }
    .badge-in { background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; }
    .badge-out { background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; }
    .badge-adjustment { background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; }
    .btn-primary { padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-secondary { padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 100%; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-control { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .error { color: #dc3545; margin: 1rem 0; padding: 0.5rem; background: #fee; border: 1px solid #fcc; border-radius: 4px; }
  `]
})
export class StockTransactionsComponent implements OnInit {
  transactions: StockTransaction[] = [];
  products: Product[] = [];
  showForm = false;
  transaction: any = { type: 'IN' };
  filterProductId: number | null = null;
  errorMsg = '';

  constructor(
    private stockService: StockTransactionService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadTransactions();
  }

  loadProducts(): void {
    this.productService.searchProducts(undefined, undefined, 0, 100).subscribe(page => this.products = page.content);
  }

  loadTransactions(): void {
    if (this.filterProductId) {
      this.stockService.getTransactionsByProduct(this.filterProductId, 0, 50)
        .subscribe(page => this.transactions = page.content);
    } else {
      this.stockService.getAllTransactions(0, 50)
        .subscribe(page => this.transactions = page.content);
    }
  }

  onSubmit(): void {
    this.errorMsg = '';
    this.stockService.createTransaction(this.transaction).subscribe({
      next: () => {
        this.showForm = false;
        this.transaction = { type: 'IN' };
        this.loadTransactions();
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Error creating transaction';
      }
    });
  }
}
