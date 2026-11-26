import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';

export interface ProductDialogData {
  product?: Product;
  categories: Category[];
}

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.product?.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า' }}</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content class="dialog-grid">
        <mat-form-field appearance="outline">
          <mat-label>SKU</mat-label>
          <input matInput formControlName="sku" required>
          <mat-error *ngIf="form.controls.sku.hasError('required')">กรุณากรอก SKU</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>ชื่อสินค้า</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="form.controls.name.hasError('required')">กรุณากรอกชื่อ</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>หมวดหมู่</mat-label>
          <mat-select formControlName="categoryId" required>
            <mat-option *ngFor="let c of data.categories" [value]="c.id">{{ c.name }}</mat-option>
          </mat-select>
          <mat-error *ngIf="form.controls.categoryId.hasError('required')">เลือกหมวดหมู่</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>หน่วย</mat-label>
          <input matInput formControlName="unit" required>
          <mat-error *ngIf="form.controls.unit.hasError('required')">กรุณากรอกหน่วย</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>ราคาทุน</mat-label>
          <input matInput type="number" formControlName="costPrice" required>
          <mat-error *ngIf="form.controls.costPrice.invalid">ราคาต้อง ≥ 0</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>ราคาขาย</mat-label>
          <input matInput type="number" formControlName="sellingPrice" required>
          <mat-error *ngIf="form.controls.sellingPrice.invalid">ราคาต้อง ≥ 0</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>สต็อกขั้นต่ำ</mat-label>
          <input matInput type="number" formControlName="minimumStock" required>
          <mat-error *ngIf="form.controls.minimumStock.invalid">ต้อง ≥ 0</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="span-2">
          <mat-label>รายละเอียด</mat-label>
          <textarea matInput rows="2" formControlName="description"></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>ยกเลิก</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">บันทึก</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.25rem 1rem;
      min-width: min(560px, 90vw);
      padding-top: 0.5rem;
    }
    .span-2 { grid-column: 1 / -1; }
    @media (max-width: 600px) {
      .dialog-grid { grid-template-columns: 1fr; }
      .span-2 { grid-column: auto; }
    }
  `]
})
export class ProductDialogComponent implements OnInit {
  form = this.fb.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    categoryId: [null as number | null, Validators.required],
    unit: ['', Validators.required],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    sellingPrice: [0, [Validators.required, Validators.min(0)]],
    minimumStock: [0, [Validators.required, Validators.min(0)]],
    description: ['']
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductDialogData
  ) {}

  ngOnInit(): void {
    if (this.data.product) {
      this.form.patchValue({
        sku: this.data.product.sku,
        name: this.data.product.name,
        categoryId: this.data.product.categoryId,
        unit: this.data.product.unit,
        costPrice: this.data.product.costPrice,
        sellingPrice: this.data.product.sellingPrice,
        minimumStock: this.data.product.minimumStock,
        description: this.data.product.description || ''
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ ...this.data.product, ...this.form.getRawValue() });
  }
}
