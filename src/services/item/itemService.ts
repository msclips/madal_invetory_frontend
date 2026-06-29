import api from '../api';

export const getItemsDatatable = async (page = 1, limit = 10, search = '') => {
  return await api.get(`/item/datatable?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
};

export const getItemAutocomplete = async (search = '') => {
  return await api.get(`/item/autocomplete?search=${search}`);
};

export const storeItem = async (data: { name: string; unit_id: number }) => {
  return await api.post(`/item/store`, data);
};

export const deleteItem = async (itemId: number) => {
  return await api.delete(`/item/delete/${itemId}`);
};

export const showItem = async (itemId: number) => {
  return await api.get(`/item/show/${itemId}`);
};

export const updateItem = async (data) => {
  return await api.put(`/item/update`, data);
};
