import apiClient from './api-client';

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
  hasFullSize?: boolean;
  hasMiniSize?: boolean;
  allowDecimal?: boolean;
  decimalPlaces?: number;
  roundingValue?: number;
  isPlainRollItem?: boolean;
  requireOpenStock: boolean;
  enableLabelPrint: boolean;
  allowFutureLabelPrint: boolean;
  sortOrder?: number;
  defaultDeliveryTurns?: number[];
  availableInTurns?: number[];
  isActive: boolean;
  createdAt?: string;
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

    const response = await apiClient.get<any>(`/api/Products?${params}`);
    const payload = response.data?.data ?? response.data;
    const rawList = payload?.Products ?? payload?.products;
    const products = Array.isArray(rawList) ? rawList : [];
    return {
      products,
      page: payload?.Page ?? payload?.page ?? page,
      pageSize: payload?.PageSize ?? payload?.pageSize ?? pageSize,
      totalPages: payload?.TotalPages ?? payload?.totalPages ?? 1,
      totalCount: payload?.TotalCount ?? payload?.totalCount ?? products.length,
    };
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<any>(`/api/Products/${id}`);
    const data = response.data?.data ?? response.data;
    return data as Product;
  },

  async create(data: CreateProductDto): Promise<Product> {
    const response = await apiClient.post<any>('/api/Products', data);
    return (response.data?.data ?? response.data) as Product;
  },

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await apiClient.put<any>(`/api/Products/${id}`, data);
    return (response.data?.data ?? response.data) as Product;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/Products/${id}`);
  },
};
