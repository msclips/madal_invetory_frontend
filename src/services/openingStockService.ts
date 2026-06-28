import api from './api';

export const getOpeningStockDatatable = async (page = 1, limit = 10) => {
  return await api.get(`/opening-stock/datatable?page=${page}&limit=${limit}`);
};

export const storeOpeningStock = async (data: { date: string; material_id: number; qty: number }) => {
  return await api.post(`/opening-stock/store`, data);
};

export const deleteOpeningStock = async (id: number) => {
  return await api.delete(`/opening-stock/delete/${id}`);
};
