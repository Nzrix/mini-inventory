import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="products-page">
      <div class="header">
        <h1>Products / สินค้า</h1>
        <button *ngIf="isAdmin" (click)="showForm = true; editMode = false; selectedProduct = {}" class="btn-primary">
          + Add Product
        </button>
      </div>
      
      <div class="filters">
        <input type="text" [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search products..." class="search-input">
        <select [(ngModel)]="filterCategoryId" (change)="onSearch()" class="filter-select">
          <option [value]="null">All Categories</option>
          <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      
      <div *ngIf="showForm" class="modal">
        <div class="modal-content">
          <h2>{{ editMode ? 'Edit' : 'Add' }} Product</h2>
          <form (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label>SKU *</label>
                <input type="text" [(ngModel)]="selectedProduct.sku" name="sku" required class="form-control">
              </div>
              <div class="form-group">
                <label>Name *</label>
                <input type="text" [(ngModel)]="selectedProduct.name" name="name" required class="form-control">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Category *</label>
                <select [(ngModel)]="selectedProduct.categoryId" name="categoryId" required class="form-control">
                  <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Unit *</label>
                <input type="text" [(ngModel)]="selectedProduct.unit" name="unit" required class="form-control">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Cost Price *</label>
                <input type="number" [(ngModel)]="selectedProduct.costPrice" name="costPrice" required class="form-control">
              </div>
              <div class="form-group">
                <label>Selling Price *</label>
                <input type="number" [(ngModel)]="selectedProduct.sellingPrice" name="sellingPrice" required class="form-control">
              </div>
              <div class="form-group">
                <label>Min Stock *</label>
                <input type="number" [(ngModel)]="selectedProduct.minimumStock" name="minStock" required class="form-control">
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" (click)="showForm = false" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Unit</th>
            <th>Cost</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let product of products" [class.low-stock]="product.isLowStock">
            <td>{{ product.sku }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.categoryName }}</td>
            <td>
              <span [class.warning]="product.isLowStock">{{ product.currentStock }}</span>
              <span *ngIf="product.isLowStock" class="badge-warning">Low</span>
            </td>
            <td>{{ product.unit }}</td>
            <td>฿{{ product.costPrice }}</td>
            <td>฿{{ product.sellingPrice }}</td>
            <td>
              <button *ngIf="isAdmin" (click)="editProduct(product)" class="btn-sm">Edit</button>
              <button *ngIf="isAdmin" (click)="deleteProduct(product.id!)" class="btn-sm btn-danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 0" class="btn-sm">Previous</button>
        <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
        <button (click)="changePage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1" class="btn-sm">Next</button>
      </div>
    </div>
  `,
  styles: [`
    .products-page { padding: 2rem; }
    .header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .search-input { flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .filter-select { padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .data-table { width: 100%; border-collapse: collapse; background: white; }
    .data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
    .data-table th { background: #f8f9fa; font-weight: 600; }
    .data-table tr.low-stock { background: #fff3cd; }
    .warning { color: #f59e0b; font-weight: bold; }
    .badge-warning { background: #f59e0b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; margin-left: 0.5rem; }
    .btn-primary { padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-secondary { padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-sm { padding: 0.375rem 0.75rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; }
    .btn-danger { background: #dc3545; }
    .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; padding: 2rem; border-radius: 8px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-control { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1rem; }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  searchTerm = '';
  filterCategoryId: number | null = null;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  showForm = false;
  editMode = false;
  selectedProduct: any = {};
  isAdmin = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(cats => this.categories = cats);
  }

  loadProducts(): void {
    this.productService.searchProducts(this.searchTerm || undefined, this.filterCategoryId || undefined, this.currentPage, this.pageSize)
      .subscribe(page => {
        this.products = page.content;
        this.totalPages = page.totalPages;
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  editProduct(product: Product): void {
    this.selectedProduct = { ...product };
    this.editMode = true;
    this.showForm = true;
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure?')) {
      this.productService.deleteProduct(id).subscribe(() => this.loadProducts());
    }
  }

  onSubmit(): void {
    const obs = this.editMode 
      ? this.productService.updateProduct(this.selectedProduct.id!, this.selectedProduct)
      : this.productService.createProduct(this.selectedProduct);
    
    obs.subscribe(() => {
      this.showForm = false;
      this.loadProducts();
    });
  }
}
