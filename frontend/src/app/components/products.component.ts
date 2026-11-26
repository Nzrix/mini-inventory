import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { AuthService } from '../services/auth.service';
import { NotifyService } from '../shared/notify.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { ProductDialogComponent } from '../shared/product-dialog.component';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatDialogModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="page-shell products-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Products</h1>
          <p class="page-subtitle">สินค้า / จัดการรายการสินค้าในคลัง</p>
        </div>
        <button *ngIf="isAdmin" mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon>
          Add Product
        </button>
      </div>

      <div class="table-toolbar">
        <mat-form-field appearance="outline" class="grow" subscriptSizing="dynamic">
          <mat-label>ค้นหาสินค้า</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Search products...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>หมวดหมู่</mat-label>
          <mat-select [(ngModel)]="filterCategoryId" (selectionChange)="onSearch()">
            <mat-option [value]="null">All Categories</mat-option>
            <mat-option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="panel">
        <div class="loading-state" *ngIf="loading">
          <mat-spinner diameter="36"></mat-spinner>
        </div>

        <div class="empty-state" *ngIf="!loading && dataSource.data.length === 0">
          <mat-icon>inventory_2</mat-icon>
          <div>ไม่พบสินค้า</div>
        </div>

        <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSort($event)" *ngIf="!loading && dataSource.data.length" class="full-width">
          <ng-container matColumnDef="sku">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>SKU</th>
            <td mat-cell *matCellDef="let row">{{ row.sku }}</td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let row">{{ row.name }}</td>
          </ng-container>
          <ng-container matColumnDef="categoryName">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let row">{{ row.categoryName }}</td>
          </ng-container>
          <ng-container matColumnDef="currentStock">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Stock</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip [class]="row.isLowStock ? 'stock-chip-low' : 'stock-chip-ok'">
                {{ row.currentStock }} {{ row.unit }}
                <span *ngIf="row.isLowStock"> · Low</span>
              </mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="costPrice">
            <th mat-header-cell *matHeaderCellDef>Cost</th>
            <td mat-cell *matCellDef="let row"><span class="money">฿{{ row.costPrice | number:'1.0-2' }}</span></td>
          </ng-container>
          <ng-container matColumnDef="sellingPrice">
            <th mat-header-cell *matHeaderCellDef>Price</th>
            <td mat-cell *matCellDef="let row"><span class="money">฿{{ row.sellingPrice | number:'1.0-2' }}</span></td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let row">
              <ng-container *ngIf="isAdmin">
                <button mat-icon-button color="primary" matTooltip="Edit" (click)="openForm(row)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" matTooltip="Delete" (click)="deleteProduct(row)"><mat-icon>delete</mat-icon></button>
              </ng-container>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" [class.low-stock-row]="row.isLowStock"></tr>
        </table>

        <mat-paginator
          [length]="totalElements"
          [pageIndex]="currentPage"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25]"
          (page)="onPage($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  displayedColumns = ['sku', 'name', 'categoryName', 'currentStock', 'costPrice', 'sellingPrice', 'actions'];
  dataSource = new MatTableDataSource<Product>([]);
  categories: Category[] = [];
  searchTerm = '';
  filterCategoryId: number | null = null;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  sortBy = 'id';
  sortDir = 'DESC';
  loading = true;
  isAdmin = false;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private dialog: MatDialog,
    private notify: NotifyService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.categoryService.getAllCategories().subscribe(cats => this.categories = cats);
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.searchProducts(
      this.searchTerm || undefined,
      this.filterCategoryId || undefined,
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDir
    ).subscribe({
      next: page => {
        this.dataSource.data = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notify.error('โหลดสินค้าไม่สำเร็จ');
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  onPage(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  onSort(sort: Sort): void {
    if (!sort.active || !sort.direction) {
      this.sortBy = 'id';
      this.sortDir = 'DESC';
    } else {
      this.sortBy = sort.active;
      this.sortDir = sort.direction.toUpperCase();
    }
    this.loadProducts();
  }

  openForm(product?: Product): void {
    const ref = this.dialog.open(ProductDialogComponent, {
      data: { product, categories: this.categories },
      width: '640px'
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      const req = product?.id
        ? this.productService.updateProduct(product.id, result)
        : this.productService.createProduct(result);
      req.subscribe({
        next: () => {
          this.notify.success(product?.id ? 'อัปเดตสินค้าแล้ว' : 'เพิ่มสินค้าแล้ว');
          this.loadProducts();
        },
        error: err => this.notify.error(err.error?.message || 'บันทึกไม่สำเร็จ')
      });
    });
  }

  deleteProduct(product: Product): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'ลบสินค้า',
        message: `ต้องการลบ "${product.name}" หรือไม่?`,
        confirmText: 'ลบ',
        warn: true
      }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok || !product.id) return;
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.notify.success('ลบสินค้าแล้ว');
          this.loadProducts();
        },
        error: err => this.notify.error(err.error?.message || 'ลบไม่สำเร็จ')
      });
    });
  }
}
