import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data?.id ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่' }}</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>ชื่อหมวดหมู่</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="form.controls.name.hasError('required')">กรุณากรอกชื่อ</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>รายละเอียด</mat-label>
          <textarea matInput rows="3" formControlName="description"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>ยกเลิก</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">บันทึก</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    mat-dialog-content { min-width: min(420px, 90vw); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class CategoryDialogComponent implements OnInit {
  form = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Category | null
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({ name: this.data.name, description: this.data.description || '' });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ ...this.data, ...this.form.getRawValue() });
  }
}
