import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ReportService } from '../services/report.service';
import { NotifyService } from '../shared/notify.service';
import { StockReport } from '../models/report.model';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, MatTabsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatCardModule, MatProgressSpinnerModule, BaseChartDirective
  ],
  template: `
    <div class="page-shell">
      <div class="page-header">
        <div>
          <h1 class="page-title">Reports</h1>
          <p class="page-subtitle">รายงานสต็อกและสินค้าใกล้หมด</p>
        </div>
      </div>

      <mat-card class="chart-card" *ngIf="valueChartData.labels?.length">
        <mat-card-header>
          <mat-card-title>มูลค่าสต็อกตามหมวดหมู่</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="chart-wrap">
            <canvas baseChart [data]="valueChartData" [options]="barOptions" [type]="'bar'"></canvas>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-tab-group class="panel tabs" animationDuration="200ms">
        <mat-tab label="Stock Report">
          <div class="tab-pad">
            <button mat-stroked-button color="primary" (click)="exportStock()" [disabled]="loadingStock">
              <mat-icon>download</mat-icon>
              Export to Excel
            </button>

            <div class="loading-state" *ngIf="loadingStock"><mat-spinner diameter="36"></mat-spinner></div>
            <div class="empty-state" *ngIf="!loadingStock && stockData.data.length === 0">
              <mat-icon>table_rows</mat-icon><div>ไม่มีข้อมูลรายงาน</div>
            </div>

            <table mat-table [dataSource]="stockData" class="full-width" *ngIf="!loadingStock && stockData.data.length">
              <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef>SKU</th><td mat-cell *matCellDef="let r">{{ r.sku }}</td></ng-container>
              <ng-container matColumnDef="productName"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let r">{{ r.productName }}</td></ng-container>
              <ng-container matColumnDef="categoryName"><th mat-header-cell *matHeaderCellDef>Category</th><td mat-cell *matCellDef="let r">{{ r.categoryName }}</td></ng-container>
              <ng-container matColumnDef="currentStock"><th mat-header-cell *matHeaderCellDef>Stock</th><td mat-cell *matCellDef="let r">{{ r.currentStock }}</td></ng-container>
              <ng-container matColumnDef="stockValue"><th mat-header-cell *matHeaderCellDef>Value</th><td mat-cell *matCellDef="let r"><span class="money">฿{{ r.stockValue | number:'1.2-2' }}</span></td></ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">
                  <mat-chip [class]="r.isLowStock ? 'stock-chip-low' : 'stock-chip-ok'">
                    {{ r.isLowStock ? 'Low Stock' : 'OK' }}
                  </mat-chip>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="stockColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: stockColumns;" [class.low-stock-row]="row.isLowStock"></tr>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="Low Stock">
          <div class="tab-pad">
            <div class="loading-state" *ngIf="loadingLow"><mat-spinner diameter="36"></mat-spinner></div>
            <div class="empty-state" *ngIf="!loadingLow && lowStockData.data.length === 0">
              <mat-icon>check_circle</mat-icon><div>ไม่มีสินค้าใกล้หมด</div>
            </div>
            <table mat-table [dataSource]="lowStockData" class="full-width" *ngIf="!loadingLow && lowStockData.data.length">
              <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef>SKU</th><td mat-cell *matCellDef="let r">{{ r.sku }}</td></ng-container>
              <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let r">{{ r.name }}</td></ng-container>
              <ng-container matColumnDef="currentStock"><th mat-header-cell *matHeaderCellDef>Current</th><td mat-cell *matCellDef="let r">{{ r.currentStock }}</td></ng-container>
              <ng-container matColumnDef="minimumStock"><th mat-header-cell *matHeaderCellDef>Min</th><td mat-cell *matCellDef="let r">{{ r.minimumStock }}</td></ng-container>
              <ng-container matColumnDef="difference">
                <th mat-header-cell *matHeaderCellDef>Difference</th>
                <td mat-cell *matCellDef="let r" class="diff">-{{ r.minimumStock - (r.currentStock || 0) }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="lowColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: lowColumns;" class="low-stock-row"></tr>
            </table>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .chart-card { margin-bottom: 1rem; }
    .tabs { overflow: hidden; }
    .tab-pad { padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
    .diff { color: var(--inv-warn); font-weight: 700; }
  `]
})
export class ReportsComponent implements OnInit {
  stockColumns = ['sku', 'productName', 'categoryName', 'currentStock', 'stockValue', 'status'];
  lowColumns = ['sku', 'name', 'currentStock', 'minimumStock', 'difference'];
  stockData = new MatTableDataSource<StockReport>([]);
  lowStockData = new MatTableDataSource<Product>([]);
  loadingStock = true;
  loadingLow = true;

  valueChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  constructor(private reportService: ReportService, private notify: NotifyService) {}

  ngOnInit(): void {
    this.reportService.getCurrentStockReport().subscribe({
      next: data => {
        this.stockData.data = data;
        this.buildValueChart(data);
        this.loadingStock = false;
      },
      error: () => { this.loadingStock = false; }
    });
    this.reportService.getLowStockProducts().subscribe({
      next: data => { this.lowStockData.data = data; this.loadingLow = false; },
      error: () => { this.loadingLow = false; }
    });
  }

  private buildValueChart(rows: StockReport[]): void {
    const byCategory = new Map<string, number>();
    rows.forEach(r => byCategory.set(r.categoryName, (byCategory.get(r.categoryName) || 0) + r.stockValue));
    this.valueChartData = {
      labels: [...byCategory.keys()],
      datasets: [{
        data: [...byCategory.values()],
        backgroundColor: '#0f766e',
        borderRadius: 6,
        label: 'Stock value'
      }]
    };
  }

  exportStock(): void {
    this.reportService.exportStockReport().subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stock-report.xlsx';
        a.click();
        this.notify.success('ส่งออก Excel แล้ว');
      },
      error: () => this.notify.error('ส่งออกไม่สำเร็จ')
    });
  }
}
