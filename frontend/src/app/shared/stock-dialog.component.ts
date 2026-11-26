import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-stock-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>บันทึกการเคลื่อนไหวสต็อก</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content class="stack">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>สินค้า</mat-label>
          <mat-select formControlName="productId" required>
            <mat-option *ngFor="let p of data.products" [value]="p.id">
              {{ p.name }} ({{ p.sku }})
            </mat-option>
          </mat-select>
          <mat-error>เลือกสินค้า</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>ประเภท</mat-label>
          <mat-select formControlName="type" required>
            <mat-option value="IN">Stock IN / รับเข้า</mat-option>
            <mat-option value="OUT">Stock OUT / จ่ายออก</mat-option>
            <mat-option value="ADJUSTMENT">Adjustment / ปรับยอด</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>จำนวน</mat-label>
          <input matInput type="number" formControlName="quantity" required>
          <mat-hint *ngIf="form.value.type === 'ADJUSTMENT'">ใช้ค่าติดลบเมื่อต้องการลดสต็อก</mat-hint>
          <mat-error>กรุณากรอกจำนวน</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>เหตุผล</mat-label>
          <textarea matInput rows="3" formControlName="reason" required></textarea>
          <mat-error>กรุณาระบุเหตุผล</mat-error>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>ยกเลิก</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">บันทึก</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .stack { display: flex; flex-direction: column; gap: 0.25rem; min-width: min(440px, 90vw); }
  `]
})
export class StockDialogComponent {
  form = this.fb.group({
    productId: [null as number | null, Validators.required],
    type: ['IN', Validators.required],
    quantity: [1, Validators.required],
    reason: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { products: Product[] }
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }
}
