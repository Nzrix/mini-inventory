export interface StockTransaction {
  id?: number;
  productId: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  balanceAfter?: number;
  reason: string;
  userId?: number;
  userName?: string;
  productName?: string;
  productSku?: string;
  createdAt?: Date;
}

export interface StockTransactionPage {
  content: StockTransaction[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
