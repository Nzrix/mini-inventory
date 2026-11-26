import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../services/report.service';
import { StockReport } from '../models/report.model';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h1>Reports / รายงาน</h1>
      
      <div class="tabs">
        <button (click)="activeTab = 'stock'" [class.active]="activeTab === 'stock'" class="tab-btn">Stock Report</button>
        <button (click)="activeTab = 'low'" [class.active]="activeTab === 'low'" class="tab-btn">Low Stock</button>
      </div>
      
      <div *ngIf="activeTab === 'stock'" class="tab-content">
        <div class="actions">
          <button (click)="exportStock()" class="btn-primary">📥 Export to Excel</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Cost</th>
              <th>Selling Price</th>
              <th>Stock Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of stockReport" [class.low-stock]="item.isLowStock">
              <td>{{ item.sku }}</td>
              <td>{{ item.productName }}</td>
              <td>{{ item.categoryName }}</td>
              <td>{{ item.currentStock }}</td>
              <td>{{ item.unit }}</td>
              <td>฿{{ item.costPrice }}</td>
              <td>฿{{ item.sellingPrice }}</td>
              <td>฿{{ item.stockValue | number:'1.2-2' }}</td>
              <td><span *ngIf="item.isLowStock" class="badge-warning">Low Stock</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div *ngIf="activeTab === 'low'" class="tab-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of lowStockProducts" class="low-stock">
              <td>{{ item.sku }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.currentStock }}</td>
              <td>{{ item.minimumStock }}</td>
              <td class="warning">-{{ item.minimumStock - item.currentStock! }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; }
    .tabs { display: flex; gap: 0.5rem; margin: 2rem 0; }
    .tab-btn { padding: 0.75rem 1.5rem; background: white; border: 1px solid #ddd; border-radius: 4px 4px 0 0; cursor: pointer; }
    .tab-btn.active { background: #667eea; color: white; border-color: #667eea; }
    .tab-content { background: white; padding: 1.5rem; border-radius: 0 4px 4px 4px; }
    .actions { margin-bottom: 1rem; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
    .data-table th { background: #f8f9fa; font-weight: 600; }
    .data-table tr.low-stock { background: #fff3cd; }
    .warning { color: #f59e0b; font-weight: bold; }
    .badge-warning { background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; }
    .btn-primary { padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; }
  `]
})
export class ReportsComponent implements OnInit {
  activeTab = 'stock';
  stockReport: StockReport[] = [];
  lowStockProducts: Product[] = [];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadStockReport();
    this.loadLowStock();
  }

  loadStockReport(): void {
    this.reportService.getCurrentStockReport().subscribe(data => this.stockReport = data);
  }

  loadLowStock(): void {
    this.reportService.getLowStockProducts().subscribe(data => this.lowStockProducts = data);
  }

  exportStock(): void {
    this.reportService.exportStockReport().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stock-report.xlsx';
      a.click();
    });
  }
}
