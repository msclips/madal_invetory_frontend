import api from './api';

export const getUnitAutocomplete = async () => {
  return await api.get(`/unit/autocomplete`);
};
