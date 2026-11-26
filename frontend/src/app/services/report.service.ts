import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockReport, DashboardData } from '../models/report.model';
import { Product } from '../models/product.model';
import { StockTransaction } from '../models/stock-transaction.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getCurrentStockReport(): Observable<StockReport[]> {
    return this.http.get<StockReport[]>(`${this.apiUrl}/stock`);
  }

  exportStockReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/stock/export`, { responseType: 'blob' });
  }

  getStockMovementReport(startDate: string, endDate: string): Observable<StockTransaction[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<StockTransaction[]>(`${this.apiUrl}/stock-movement`, { params });
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock`);
  }

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }
}
