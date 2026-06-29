import api from '../api';

export const getOpeningStockDatatable = async (page = 1, limit = 10, search = '') => {
  return await api.get(`/opening-stock/datatable?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
};

export const storeOpeningStock = async (data: { date: string; item_id: number; qty: number }) => {
  return await api.post(`/opening-stock/store`, data);
};

export const deleteOpeningStock = async (id: number) => {
  return await api.delete(`/opening-stock/delete/${id}`);
};
