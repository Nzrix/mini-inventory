import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="header">
        <h1>Categories / หมวดหมู่สินค้า</h1>
        <button (click)="showForm = true; editMode = false; selectedCategory = {}" class="btn-primary">+ Add Category</button>
      </div>
      
      <div *ngIf="showForm" class="modal">
        <div class="modal-content">
          <h2>{{ editMode ? 'Edit' : 'Add' }} Category</h2>
          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Name *</label>
              <input type="text" [(ngModel)]="selectedCategory.name" name="name" required class="form-control">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="selectedCategory.description" name="description" class="form-control" rows="3"></textarea>
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
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let category of categories">
            <td>{{ category.name }}</td>
            <td>{{ category.description }}</td>
            <td>
              <button (click)="edit(category)" class="btn-sm">Edit</button>
              <button (click)="delete(category.id!)" class="btn-sm btn-danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; }
    .header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
    .data-table { width: 100%; border-collapse: collapse; background: white; }
    .data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
    .data-table th { background: #f8f9fa; font-weight: 600; }
    .btn-primary { padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-secondary { padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-sm { padding: 0.375rem 0.75rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; }
    .btn-danger { background: #dc3545; }
    .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 100%; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-control { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  showForm = false;
  editMode = false;
  selectedCategory: any = {};

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.categoryService.getAllCategories().subscribe(cats => this.categories = cats);
  }

  edit(category: Category): void {
    this.selectedCategory = { ...category };
    this.editMode = true;
    this.showForm = true;
  }

  delete(id: number): void {
    if (confirm('Are you sure?')) {
      this.categoryService.deleteCategory(id).subscribe(() => this.load());
    }
  }

  onSubmit(): void {
    const obs = this.editMode 
      ? this.categoryService.updateCategory(this.selectedCategory.id!, this.selectedCategory)
      : this.categoryService.createCategory(this.selectedCategory);
    
    obs.subscribe(() => {
      this.showForm = false;
      this.load();
    });
  }
}
