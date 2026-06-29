import api from '../api';

export const getClosingStock = async (item_id: number) => {
  return await api.get(`/ledger/closing-stock/${item_id}`);
};

export const getLedgerDatatable = async (page = 1, limit = 10, search = '', from_date = '', to_date = '', item_id = '') => {
  return await api.get(`/ledger/datatable?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&from_date=${from_date}&to_date=${to_date}&item_id=${item_id}`);
};
