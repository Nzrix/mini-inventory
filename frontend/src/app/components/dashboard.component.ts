import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ReportService } from '../services/report.service';
import { DashboardData } from '../models/report.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule, BaseChartDirective
  ],
  template: `
    <div class="page-shell">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">แดชบอร์ดสรุปสต็อกและมูลค่าสินค้า</p>
        </div>
      </div>

      <div class="loading-state" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <div>กำลังโหลดข้อมูล...</div>
      </div>

      <ng-container *ngIf="!loading && dashboardData">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-icon>inventory</mat-icon>
            <div>
              <div class="label">สินค้าทั้งหมด</div>
              <div class="value">{{ dashboardData.totalProducts }}</div>
            </div>
          </mat-card>
          <mat-card class="stat-card warn">
            <mat-icon>warning_amber</mat-icon>
            <div>
              <div class="label">สินค้าใกล้หมด</div>
              <div class="value">{{ dashboardData.lowStockCount }}</div>
            </div>
          </mat-card>
          <mat-card class="stat-card success">
            <mat-icon>payments</mat-icon>
            <div>
              <div class="label">มูลค่าสต็อก</div>
              <div class="value money">฿{{ dashboardData.totalStockValue | number:'1.2-2' }}</div>
            </div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon>folder</mat-icon>
            <div>
              <div class="label">หมวดหมู่</div>
              <div class="value">{{ dashboardData.totalCategories }}</div>
            </div>
          </mat-card>
        </div>

        <div class="charts-grid">
          <mat-card>
            <mat-card-header>
              <mat-card-title>มูลค่าสต็อกตามหมวดหมู่</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-wrap" *ngIf="categoryChartData.labels?.length; else noCategory">
                <canvas baseChart
                  [data]="categoryChartData"
                  [options]="doughnutOptions"
                  [type]="'doughnut'">
                </canvas>
              </div>
              <ng-template #noCategory>
                <div class="empty-state"><mat-icon>pie_chart</mat-icon><div>ยังไม่มีข้อมูลหมวดหมู่</div></div>
              </ng-template>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>สินค้าเคลื่อนไหวสูงสุด</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-wrap" *ngIf="topMovingChartData.labels?.length; else noMoving">
                <canvas baseChart
                  [data]="topMovingChartData"
                  [options]="barOptions"
                  [type]="'bar'">
                </canvas>
              </div>
              <ng-template #noMoving>
                <div class="empty-state"><mat-icon>bar_chart</mat-icon><div>ยังไม่มีข้อมูลการเคลื่อนไหว</div></div>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
    }
    .stat-card mat-icon {
      width: 42px; height: 42px; font-size: 42px; color: var(--inv-primary);
    }
    .stat-card.warn mat-icon { color: var(--inv-warn); }
    .stat-card.success mat-icon { color: var(--inv-success); }
    .label { color: var(--inv-muted); font-size: 0.85rem; }
    .value { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1rem;
    }
    mat-card-header { margin-bottom: 0.5rem; }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  dashboardData?: DashboardData;

  categoryChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  topMovingChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.reportService.getDashboardData().subscribe({
      next: data => {
        this.dashboardData = data;
        this.buildCharts(data);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private buildCharts(data: DashboardData): void {
    const categories = Object.keys(data.stockValueByCategory || {});
    const values = Object.values(data.stockValueByCategory || {});
    this.categoryChartData = {
      labels: categories,
      datasets: [{
        data: values,
        backgroundColor: ['#0f766e', '#0ea5e9', '#d97706', '#7c3aed', '#059669', '#ea580c']
      }]
    };

    const top = data.topMovingProducts || [];
    this.topMovingChartData = {
      labels: top.map(p => p.productName),
      datasets: [{
        data: top.map(p => p.totalMovement),
        label: 'Units',
        backgroundColor: '#0f766e',
        borderRadius: 6
      }]
    };
  }
}
