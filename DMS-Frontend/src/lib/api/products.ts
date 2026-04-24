import apiClient, { type ApiEnvelope } from './client';

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  unitOfMeasureId: string;
  unitOfMeasure: string;
  unitPrice: number;
  productType?: string;
  productionSection?: string;
  hasFullSize: boolean;
  hasMiniSize: boolean;
  allowDecimal: boolean;
  decimalPlaces: number;
  roundingValue: number;
  isPlainRollItem: boolean;
  requireOpenStock: boolean;
  enableLabelPrint: boolean;
  allowFutureLabelPrint: boolean;
  sortOrder: number;
  defaultDeliveryTurns: number[];
  availableInTurns: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  code: string;
  name: string;
  description?: string;
  categoryId: string;
  unitOfMeasureId: string;
  unitPrice: number;
  productType?: string;
  productionSection?: string;
  hasFullSize: boolean;
  hasMiniSize: boolean;
  allowDecimal: boolean;
  decimalPlaces: number;
  roundingValue: number;
  isPlainRollItem: boolean;
  requireOpenStock: boolean;
  enableLabelPrint: boolean;
  allowFutureLabelPrint: boolean;
  sortOrder: number;
  defaultDeliveryTurns: number[];
  availableInTurns: number[];
  isActive: boolean;
}

export interface UpdateProductDto {
  code: string;
  name: string;
  description?: string;
  categoryId: string;
  unitOfMeasureId: string;
  unitPrice: number;
  productType?: string;
  productionSection?: string;
  hasFullSize: boolean;
  hasMiniSize: boolean;
  allowDecimal: boolean;
  decimalPlaces: number;
  roundingValue: number;
  isPlainRollItem: boolean;
  requireOpenStock: boolean;
  enableLabelPrint: boolean;
  allowFutureLabelPrint: boolean;
  sortOrder: number;
  defaultDeliveryTurns: number[];
  availableInTurns: number[];
  isActive: boolean;
}

export interface ProductsResponse {
  products: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const productsApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    categoryId?: string,
    activeOnly?: boolean
  ): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);
    if (activeOnly !== undefined) params.append('activeOnly', activeOnly.toString());

    const response = await apiClient.get<ApiEnvelope<ProductsResponse>>(`/api/Products?${params}`);
    return response.data.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<ApiEnvelope<Product>>(`/api/Products/${id}`);
    return response.data.data;
  },

  async create(data: CreateProductDto): Promise<Product> {
    const response = await apiClient.post<ApiEnvelope<Product>>('/api/Products', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await apiClient.put<ApiEnvelope<Product>>(`/api/Products/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/Products/${id}`);
  },
};
