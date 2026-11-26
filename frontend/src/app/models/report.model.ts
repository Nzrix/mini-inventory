export interface StockReport {
  productId: number;
  sku: string;
  productName: string;
  categoryName: string;
  currentStock: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stockValue: number;
  minimumStock: number;
  isLowStock: boolean;
}

export interface DashboardData {
  totalProducts: number;
  lowStockCount: number;
  totalStockValue: number;
  totalCategories: number;
  topMovingProducts: TopProduct[];
  stockValueByCategory: { [key: string]: number };
}

export interface TopProduct {
  productName: string;
  sku: string;
  totalMovement: number;
}
