import api from '../api';

export const getItemOutwardDatatable = async (page = 1, limit = 10, search = '') => {
  return await api.get(`/item-outward/datatable?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
};

export const storeItemOutward = async (data: { date: string; item_id: number; qty: number }) => {
  return await api.post(`/item-outward/store`, data);
};

export const deleteItemOutward = async (id: number) => {
  return await api.delete(`/item-outward/delete/${id}`);
};
