import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StockTransactionService } from '../services/stock-transaction.service';
import { ProductService } from '../services/product.service';
import { NotifyService } from '../shared/notify.service';
import { StockDialogComponent } from '../shared/stock-dialog.component';
import { StockTransaction } from '../models/stock-transaction.model';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-stock-transactions',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatFormFieldModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatDialogModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-shell">
      <div class="page-header">
        <div>
          <h1 class="page-title">Stock Transactions</h1>
          <p class="page-subtitle">การเคลื่อนไหวสต็อก IN / OUT / ADJUSTMENT</p>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon>
          New Transaction
        </button>
      </div>

      <div class="table-toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>กรองตามสินค้า</mat-label>
          <mat-select [(ngModel)]="filterProductId" (selectionChange)="loadTransactions()">
            <mat-option [value]="null">All Products</mat-option>
            <mat-option *ngFor="let p of products" [value]="p.id">{{ p.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="panel">
        <div class="loading-state" *ngIf="loading">
          <mat-spinner diameter="36"></mat-spinner>
        </div>
        <div class="empty-state" *ngIf="!loading && dataSource.data.length === 0">
          <mat-icon>swap_vert</mat-icon>
          <div>ยังไม่มีรายการเคลื่อนไหว</div>
        </div>
        <table mat-table [dataSource]="dataSource" class="full-width" *ngIf="!loading && dataSource.data.length">
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let row">{{ row.createdAt | date:'short' }}</td>
          </ng-container>
          <ng-container matColumnDef="productName">
            <th mat-header-cell *matHeaderCellDef>Product</th>
            <td mat-cell *matCellDef="let row">{{ row.productName }}</td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip [ngClass]="'type-chip-' + (row.type | lowercase)">{{ row.type }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Qty</th>
            <td mat-cell *matCellDef="let row">{{ row.quantity }}</td>
          </ng-container>
          <ng-container matColumnDef="balanceAfter">
            <th mat-header-cell *matHeaderCellDef>Balance</th>
            <td mat-cell *matCellDef="let row">{{ row.balanceAfter }}</td>
          </ng-container>
          <ng-container matColumnDef="reason">
            <th mat-header-cell *matHeaderCellDef>Reason</th>
            <td mat-cell *matCellDef="let row">{{ row.reason }}</td>
          </ng-container>
          <ng-container matColumnDef="userName">
            <th mat-header-cell *matHeaderCellDef>User</th>
            <td mat-cell *matCellDef="let row">{{ row.userName }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `
})
export class StockTransactionsComponent implements OnInit {
  displayedColumns = ['createdAt', 'productName', 'type', 'quantity', 'balanceAfter', 'reason', 'userName'];
  dataSource = new MatTableDataSource<StockTransaction>([]);
  products: Product[] = [];
  filterProductId: number | null = null;
  loading = true;

  constructor(
    private stockService: StockTransactionService,
    private productService: ProductService,
    private dialog: MatDialog,
    private notify: NotifyService
  ) {}

  ngOnInit(): void {
    this.productService.searchProducts(undefined, undefined, 0, 100).subscribe(page => this.products = page.content);
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    const req = this.filterProductId
      ? this.stockService.getTransactionsByProduct(this.filterProductId, 0, 50)
      : this.stockService.getAllTransactions(0, 50);
    req.subscribe({
      next: page => {
        this.dataSource.data = page.content;
        this.loading = false;
      },
      error: () => { this.loading = false; this.notify.error('โหลดรายการไม่สำเร็จ'); }
    });
  }

  openForm(): void {
    const ref = this.dialog.open(StockDialogComponent, {
      data: { products: this.products },
      width: '480px'
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      this.stockService.createTransaction(result).subscribe({
        next: () => {
          this.notify.success('บันทึกการเคลื่อนไหวแล้ว');
          this.loadTransactions();
        },
        error: err => this.notify.error(err.error?.message || 'Error creating transaction')
      });
    });
  }
}
