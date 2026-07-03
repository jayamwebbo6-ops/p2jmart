import api from './api';


export const adminGetSalesReportAPI = async (params = {}) => {
  const response = await api.get('/sales-report/admin/summary', { params });
  return response.data;
};

export const adminGetProductWiseSalesReportAPI = async (params = {}) => {
  const response = await api.get('/sales-report/admin/product-wise', { params });
  return response.data;
};