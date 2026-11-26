export interface Product {
  id?: number;
  sku: string;
  name: string;
  description?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  minimumStock: number;
  categoryId: number;
  categoryName?: string;
  currentStock?: number;
  isLowStock?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
