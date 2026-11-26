import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoryService } from '../services/category.service';
import { NotifyService } from '../shared/notify.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { CategoryDialogComponent } from '../shared/category-dialog.component';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="page-shell">
      <div class="page-header">
        <div>
          <h1 class="page-title">Categories</h1>
          <p class="page-subtitle">หมวดหมู่สินค้า (Admin only)</p>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon>
          Add Category
        </button>
      </div>

      <div class="panel">
        <div class="loading-state" *ngIf="loading">
          <mat-spinner diameter="36"></mat-spinner>
        </div>
        <div class="empty-state" *ngIf="!loading && dataSource.data.length === 0">
          <mat-icon>folder_off</mat-icon>
          <div>ยังไม่มีหมวดหมู่</div>
        </div>
        <table mat-table [dataSource]="dataSource" class="full-width" *ngIf="!loading && dataSource.data.length">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let row">{{ row.name }}</td>
          </ng-container>
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let row">{{ row.description || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" matTooltip="Edit" (click)="openForm(row)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" matTooltip="Delete" (click)="delete(row)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `
})
export class CategoriesComponent implements OnInit {
  displayedColumns = ['name', 'description', 'actions'];
  dataSource = new MatTableDataSource<Category>([]);
  loading = true;

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private notify: NotifyService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: cats => {
        this.dataSource.data = cats;
        this.loading = false;
      },
      error: () => { this.loading = false; this.notify.error('โหลดหมวดหมู่ไม่สำเร็จ'); }
    });
  }

  openForm(category?: Category): void {
    const ref = this.dialog.open(CategoryDialogComponent, {
      data: category || null,
      width: '480px'
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      const req = category?.id
        ? this.categoryService.updateCategory(category.id, result)
        : this.categoryService.createCategory(result);
      req.subscribe({
        next: () => {
          this.notify.success(category?.id ? 'อัปเดตหมวดหมู่แล้ว' : 'เพิ่มหมวดหมู่แล้ว');
          this.load();
        },
        error: err => this.notify.error(err.error?.message || 'บันทึกไม่สำเร็จ')
      });
    });
  }

  delete(category: Category): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'ลบหมวดหมู่',
        message: `ต้องการลบ "${category.name}" หรือไม่?`,
        confirmText: 'ลบ',
        warn: true
      }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok || !category.id) return;
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => { this.notify.success('ลบหมวดหมู่แล้ว'); this.load(); },
        error: err => this.notify.error(err.error?.message || 'ลบไม่สำเร็จ')
      });
    });
  }
}
