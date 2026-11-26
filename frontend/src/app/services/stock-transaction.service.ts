import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockTransaction, StockTransactionPage } from '../models/stock-transaction.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockTransactionService {
  private apiUrl = `${environment.apiUrl}/stock-transactions`;

  constructor(private http: HttpClient) {}

  createTransaction(transaction: StockTransaction): Observable<StockTransaction> {
    return this.http.post<StockTransaction>(this.apiUrl, transaction);
  }

  getAllTransactions(page = 0, size = 50): Observable<StockTransactionPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<StockTransactionPage>(this.apiUrl, { params });
  }

  getTransactionsByProduct(productId: number, page = 0, size = 10): Observable<StockTransactionPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<StockTransactionPage>(`${this.apiUrl}/product/${productId}`, { params });
  }

  getCurrentStock(productId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/product/${productId}/current-stock`);
  }
}
