import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="app-container" *ngIf="currentUser">
      <nav class="navbar">
        <div class="nav-brand">
          <h2>Inventory System</h2>
        </div>
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
          <a routerLink="/products" routerLinkActive="active">Products</a>
          <a routerLink="/categories" routerLinkActive="active" *ngIf="isAdmin">Categories</a>
          <a routerLink="/stock-transactions" routerLinkActive="active">Stock</a>
          <a routerLink="/reports" routerLinkActive="active">Reports</a>
        </div>
        <div class="nav-user">
          <span>{{ currentUser.fullName }} ({{ currentUser.role }})</span>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
    <router-outlet *ngIf="!currentUser"></router-outlet>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f5f5f5;
    }
    
    .navbar {
      background: #667eea;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .nav-brand h2 {
      margin: 0;
      font-size: 1.5rem;
    }
    
    .nav-links {
      display: flex;
      gap: 1.5rem;
      flex: 1;
    }
    
    .nav-links a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background 0.3s;
    }
    
    .nav-links a:hover, .nav-links a.active {
      background: rgba(255,255,255,0.2);
    }
    
    .nav-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .btn-logout {
      padding: 0.5rem 1rem;
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn-logout:hover {
      background: rgba(255,255,255,0.3);
    }
    
    .main-content {
      max-width: 1400px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {
  currentUser: User | null = null;
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
