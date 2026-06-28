import api from './api';

export const getClosingStock = async (item_id: number) => {
  return await api.get(`/ledger/closing-stock/${item_id}`);
};
