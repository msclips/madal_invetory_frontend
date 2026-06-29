import React, { useEffect, useState } from 'react';
import { PackageOpen, Plus, Search, Trash2 } from 'lucide-react';
import { getItemInwardDatatable, deleteItemInward } from '../../services/itemInward/itemInwardService';
import { getItemInwardTableConfig } from '../../config/tableConfig';
import { useTranslate } from '../../config/translate/translateContext';
import AddItemInwardModal from './AddItemInwardModal';

interface Item {
  id: number;
  name: string;
}

interface ItemInwardItem {
  id: number;
  date: string;
  item_id: number;
  qty: number;
  item_name: string;
  is_delete: boolean;
}

const ItemInwards = () => {
  const [items, setItems] = useState<ItemInwardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const { translang } = useTranslate();
  const tableConfig = getItemInwardTableConfig(translang);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchItems(page);
  }, [page]);

  const fetchItems = async (currentPage: number) => {
    setLoading(true);
    try {
      const response = await getItemInwardDatatable(currentPage, limit);
      const { data } = response.data;
      if (response.data.status) {
        setItems(data.data);
        setTotal(data.total);
      } else {
        setError(response.data.message || translang.failed_fetch_item_inward);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || translang.network_error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      try {
        await deleteItemInward(id);
        fetchItems(page);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete item inward");
      }
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageOpen size={24} /> {translang.item_inward_title}
          </h1>
          <p style={{ margin: 0, color: 'var(--accents-6)' }}>{translang.item_inward_description}</p>
        </div>
        <button className="btn btn-primary" onClick={openModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> {translang.add_item_inward}
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accents-5)' }} />
            <input 
              type="text" 
              placeholder={translang.search_item_inward} 
              style={{ 
                width: '100%', 
                padding: '8px 12px 8px 36px', 
                borderRadius: '6px', 
                border: '1px solid var(--border-color)',
                outline: 'none'
              }} 
            />
          </div>
        </div>

        {error && (
          <div style={{ padding: '16px 24px', color: 'var(--error-color)', background: '#fee' }}>
            {error}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--accents-1)', borderBottom: '1px solid var(--border-color)' }}>
                {tableConfig.map((col, idx) => (
                  <th key={idx} style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--accents-6)' }}>
                    {col.label}
                  </th>
                ))}
                <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--accents-6)', textAlign: 'right' }}>{translang.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={tableConfig.length + 1} style={{ padding: '32px', textAlign: 'center', color: 'var(--accents-5)' }}>
                    {translang.loading_item_inward}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={tableConfig.length + 1} style={{ padding: '32px', textAlign: 'center', color: 'var(--accents-5)' }}>
                    {translang.no_item_inward_found}
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {tableConfig.map((col, idx) => {
                      const value = col.key.split('.').reduce((o, i) => (o ? o[i] : null), item as any);
                      return (
                        <td key={idx} style={{ padding: '16px 24px', fontWeight: col.key === 'date' ? 500 : 400 }}>
                          {col.render ? col.render(value, item) : value}
                        </td>
                      );
                    })}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      {item.is_delete && (
                        <button 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-color)' }}
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--accents-5)' }}>
              {translang.showing} {(page - 1) * limit + 1} {translang.to} {Math.min(page * limit, total)} {translang.of} {total} {translang.results}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn"
                style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', color: page === 1 ? 'var(--accents-3)' : 'var(--foreground-color)' }}
              >
                {translang.previous}
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="btn"
                style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', color: page >= totalPages ? 'var(--accents-3)' : 'var(--foreground-color)' }}
              >
                {translang.next}
              </button>
            </div>
          </div>
        )}
      </div>

      <AddItemInwardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchItems(page)} 
      />
    </div>
  );
};

export default ItemInwards;
