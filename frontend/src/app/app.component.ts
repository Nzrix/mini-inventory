import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { map, shareReplay, take } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule
  ],
  template: `
    <ng-container *ngIf="currentUser; else guest">
      <mat-sidenav-container class="shell">
        <mat-sidenav
          #drawer
          class="sidenav"
          [mode]="(isHandset$ | async) ? 'over' : 'side'"
          [opened]="!(isHandset$ | async)"
          fixedInViewport>
          <div class="brand">
            <mat-icon>inventory_2</mat-icon>
            <div>
              <div class="brand-title">Mini Inventory</div>
              <div class="brand-sub">ระบบจัดการสต็อก</div>
            </div>
          </div>
          <mat-nav-list>
            <a mat-list-item routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeIfHandset()">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/products" routerLinkActive="active" (click)="closeIfHandset()">
              <mat-icon matListItemIcon>category</mat-icon>
              <span matListItemTitle>Products</span>
            </a>
            <a mat-list-item *ngIf="isAdmin" routerLink="/categories" routerLinkActive="active" (click)="closeIfHandset()">
              <mat-icon matListItemIcon>folder</mat-icon>
              <span matListItemTitle>Categories</span>
            </a>
            <a mat-list-item routerLink="/stock-transactions" routerLinkActive="active" (click)="closeIfHandset()">
              <mat-icon matListItemIcon>swap_vert</mat-icon>
              <span matListItemTitle>Stock</span>
            </a>
            <a mat-list-item routerLink="/reports" routerLinkActive="active" (click)="closeIfHandset()">
              <mat-icon matListItemIcon>assessment</mat-icon>
              <span matListItemTitle>Reports</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content>
          <mat-toolbar class="topbar">
            <button mat-icon-button type="button" (click)="drawer.toggle()" aria-label="Toggle menu">
              <mat-icon>menu</mat-icon>
            </button>
            <span class="toolbar-title">Inventory System</span>
            <span class="spacer"></span>
            <span class="user-chip">{{ currentUser.fullName }} · {{ currentUser.role }}</span>
            <button mat-stroked-button type="button" (click)="logout()">
              <mat-icon>logout</mat-icon>
              Logout
            </button>
          </mat-toolbar>
          <main class="content">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </ng-container>

    <ng-template #guest>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .shell { min-height: 100vh; background: var(--inv-surface); }
    .sidenav {
      width: 260px;
      background: var(--inv-sidebar);
      color: rgba(255, 255, 255, 0.85);
      border: none;
    }
    .brand {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      padding: 1.25rem 1rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      color: #fff;
    }
    .brand mat-icon { color: #5eead4; }
    .brand-title { font-weight: 600; font-size: 1.05rem; color: #fff; }
    .brand-sub { font-size: 0.8rem; color: rgba(255, 255, 255, 0.65); }
    .sidenav a.mat-mdc-list-item,
    .sidenav a.mat-mdc-list-item .mdc-list-item__primary-text,
    .sidenav a.mat-mdc-list-item mat-icon {
      color: rgba(255, 255, 255, 0.85) !important;
    }
    .sidenav a.mat-mdc-list-item:hover {
      background: rgba(255, 255, 255, 0.06);
    }
    .sidenav a.mat-mdc-list-item.active {
      background: rgba(94, 234, 212, 0.18) !important;
    }
    .sidenav a.mat-mdc-list-item.active,
    .sidenav a.mat-mdc-list-item.active .mdc-list-item__primary-text,
    .sidenav a.mat-mdc-list-item.active mat-icon {
      color: #ffffff !important;
    }
    .topbar {
      background: var(--inv-card);
      color: var(--inv-ink);
      border-bottom: 1px solid var(--inv-border);
      position: sticky;
      top: 0;
      z-index: 2;
      gap: 0.5rem;
    }
    .toolbar-title { font-weight: 600; }
    .spacer { flex: 1; }
    .user-chip {
      color: var(--inv-muted);
      font-size: 0.9rem;
      margin-right: 0.5rem;
    }
    .content { min-height: calc(100vh - 64px); }
    @media (max-width: 600px) {
      .user-chip { display: none; }
    }
  `]
})
export class AppComponent {
  @ViewChild('drawer') drawer?: MatSidenav;
  currentUser: User | null = null;
  isAdmin = false;

  isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(result => result.matches),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  closeIfHandset(): void {
    this.isHandset$.pipe(take(1)).subscribe(isHandset => {
      if (isHandset) {
        this.drawer?.close();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
