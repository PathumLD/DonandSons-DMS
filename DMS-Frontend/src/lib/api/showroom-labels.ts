import api from './api-client';

export interface ShowroomLabelPrintData {
  outletCode: string;
  outletName: string;
  productCode: string;
  productName: string;
  price: number;
  stockAsAt: string;
}

export interface GenerateShowroomLabelsDto {
  outletId: string;
}

const BASE_URL = '/api/labels/showroom';

export const showroomLabelsApi = {
  generatePrintData: async (outletId: string) => {
    const response = await api.post<ShowroomLabelPrintData[]>(BASE_URL, { outletId });
    return response.data;
  },
};
