import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../services/report.service';
import { DashboardData } from '../models/report.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>Dashboard / แดชบอร์ด</h1>
      
      <div class="stats-grid" *ngIf="dashboardData">
        <div class="stat-card">
          <h3>Total Products</h3>
          <div class="stat-value">{{ dashboardData.totalProducts }}</div>
        </div>
        
        <div class="stat-card warning">
          <h3>Low Stock Items</h3>
          <div class="stat-value">{{ dashboardData.lowStockCount }}</div>
        </div>
        
        <div class="stat-card success">
          <h3>Total Stock Value</h3>
          <div class="stat-value">฿{{ dashboardData.totalStockValue | number:'1.2-2' }}</div>
        </div>
        
        <div class="stat-card">
          <h3>Categories</h3>
          <div class="stat-value">{{ dashboardData.totalCategories }}</div>
        </div>
      </div>
      
      <div class="charts-section" *ngIf="dashboardData">
        <div class="chart-card">
          <h3>Top Moving Products</h3>
          <div class="top-products">
            <div *ngFor="let product of dashboardData.topMovingProducts" class="product-item">
              <span class="product-name">{{ product.productName }} ({{ product.sku }})</span>
              <span class="product-movement">{{ product.totalMovement }} units</span>
            </div>
            <div *ngIf="dashboardData.topMovingProducts.length === 0" class="no-data">
              No movement data available
            </div>
          </div>
        </div>
        
        <div class="chart-card">
          <h3>Stock Value by Category</h3>
          <div class="category-values">
            <div *ngFor="let item of getCategoryValues()" class="category-item">
              <span class="category-name">{{ item.category }}</span>
              <span class="category-value">฿{{ item.value | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
    }
    
    h1 {
      margin-bottom: 2rem;
      color: #333;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #667eea;
    }
    
    .stat-card.warning {
      border-left-color: #f59e0b;
    }
    
    .stat-card.success {
      border-left-color: #10b981;
    }
    
    .stat-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      color: #666;
      text-transform: uppercase;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
    }
    
    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .chart-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .chart-card h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }
    
    .product-item, .category-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
    }
    
    .product-item:last-child, .category-item:last-child {
      border-bottom: none;
    }
    
    .product-movement, .category-value {
      font-weight: 600;
      color: #667eea;
    }
    
    .no-data {
      text-align: center;
      color: #999;
      padding: 2rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboardData?: DashboardData;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.reportService.getDashboardData().subscribe(data => {
      this.dashboardData = data;
    });
  }

  getCategoryValues(): { category: string; value: number }[] {
    if (!this.dashboardData?.stockValueByCategory) return [];
    return Object.entries(this.dashboardData.stockValueByCategory).map(([category, value]) => ({
      category,
      value
    }));
  }
}
