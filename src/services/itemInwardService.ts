import api from './api';

export const getItemInwardDatatable = async (page = 1, limit = 10) => {
  return await api.get(`/item-inward/datatable?page=${page}&limit=${limit}`);
};

export const storeItemInward = async (data: { date: string; item_id: number; qty: number }) => {
  return await api.post(`/item-inward/store`, data);
};

export const deleteItemInward = async (id: number) => {
  return await api.delete(`/item-inward/delete/${id}`);
};
