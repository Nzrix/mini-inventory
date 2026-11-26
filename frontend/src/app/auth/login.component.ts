import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';
import { NotifyService } from '../shared/notify.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-page">
      <div class="login-hero">
        <mat-icon class="hero-icon">inventory_2</mat-icon>
        <h1>Mini Inventory</h1>
        <p>ระบบจัดการสต็อกสำหรับร้านค้าขนาดเล็ก</p>
      </div>

      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>เข้าสู่ระบบ</mat-card-title>
          <mat-card-subtitle>Sign in to continue</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput id="username" formControlName="username" autocomplete="username" required>
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="form.controls.username.hasError('required')">กรุณากรอกชื่อผู้ใช้</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput id="password" type="password" formControlName="password" autocomplete="current-password" required>
              <mat-icon matPrefix>lock</mat-icon>
              <mat-error *ngIf="form.controls.password.hasError('required')">กรุณากรอกรหัสผ่าน</mat-error>
            </mat-form-field>

            <div class="error-banner" *ngIf="errorMessage">{{ errorMessage }}</div>

            <button mat-flat-button color="primary" class="full-width submit" type="submit" [disabled]="form.invalid || loading">
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
              <span *ngIf="!loading">เข้าสู่ระบบ</span>
            </button>
          </form>
        </mat-card-content>
        <mat-card-footer class="demo">
          <div><strong>Demo</strong></div>
          <div>Admin: <code>admin</code> / <code>password123</code></div>
          <div>Staff: <code>staff</code> / <code>password123</code></div>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 1.5rem;
      background:
        radial-gradient(circle at top left, rgba(15, 118, 110, 0.18), transparent 40%),
        radial-gradient(circle at bottom right, rgba(217, 119, 6, 0.12), transparent 35%),
        linear-gradient(160deg, #0f172a 0%, #134e4a 55%, #0f766e 100%);
    }
    .login-hero {
      position: absolute;
      top: 8%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      color: white;
    }
    .hero-icon { font-size: 48px; width: 48px; height: 48px; color: #5eead4; }
    .login-hero h1 { margin: 0.5rem 0 0.25rem; font-size: 2rem; font-weight: 700; }
    .login-hero p { margin: 0; opacity: 0.85; }
    .login-card {
      width: min(420px, 100%);
      margin-top: 6rem;
      border-radius: 16px;
      padding-bottom: 0.5rem;
    }
    mat-card-header { margin-bottom: 1rem; }
    form { display: flex; flex-direction: column; gap: 0.25rem; padding-top: 0.5rem; }
    .submit { height: 44px; margin-top: 0.5rem; }
    .error-banner {
      background: #fee2e2;
      color: #991b1b;
      border-radius: 8px;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    .demo {
      display: block;
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--inv-border);
      color: var(--inv-muted);
      font-size: 0.85rem;
      line-height: 1.7;
    }
    code {
      background: #f1f5f9;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-family: ui-monospace, monospace;
    }
    @media (max-width: 600px) {
      .login-hero { position: static; transform: none; margin-bottom: 1rem; }
      .login-card { margin-top: 0; }
      .login-page { align-content: center; }
    }
  `]
})
export class LoginComponent {
  loading = false;
  errorMessage = '';
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notify: NotifyService
  ) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const { username, password } = this.form.getRawValue();
    this.authService.login({ username: username!, password: password! }).subscribe({
      next: () => {
        this.notify.success('เข้าสู่ระบบสำเร็จ');
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage = 'Invalid username or password';
        this.loading = false;
      }
    });
  }
}
