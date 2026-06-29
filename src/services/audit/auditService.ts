import api from '../api';

export const getAuditDatatable = async (page = 1, limit = 10, search = '') => {
  return await api.get(`/audit/datatable?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
};
