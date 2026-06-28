import React, { useState, useEffect } from 'react';
import { getItemAutocomplete } from '../../services/item/itemService';
import { storeOpeningStock } from '../../services/openingStock/openingStockService';
import { useTranslate } from '../../config/translate/translateContext';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

interface AddOpeningStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddOpeningStockModal: React.FC<AddOpeningStockModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { translang } = useTranslate();
  const [items, setItems] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], item_id: '', qty: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen && items.length === 0) {
      fetchItems();
    }
  }, [isOpen]);

  const fetchItems = async () => {
    try {
      const response = await getItemAutocomplete('');
      if (response.data.status) {
        setItems(response.data.data);
      }
    } catch (e) {
      console.error('Failed to load items', e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend Validation
    const errors: { [key: string]: string } = {};
    if (!formData.date.trim()) {
      errors.date = translang.validation_date_required;
    }
    if (!formData.item_id) {
      errors.item_id = translang.validation_item_required;
    }
    if (!formData.qty || isNaN(Number(formData.qty)) || Number(formData.qty) <= 0) {
      errors.qty = translang.validation_quantity_required;
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setValidationErrors({});
    
    try {
      const response = await storeOpeningStock({ 
        date: formData.date, 
        item_id: Number(formData.item_id), 
        qty: Number(formData.qty) 
      });
      
      if (response.data.status) {
        setFormData({ date: new Date().toISOString().split('T')[0], item_id: '', qty: '' });
        onSuccess();
        onClose();
      } else {
        if (response.data.validation_error) {
          const fieldErrors: { [key: string]: string } = {};
          response.data.errors.forEach((err: any) => {
            fieldErrors[err.field] = err.message;
          });
          setValidationErrors(fieldErrors);
        } else {
          setError(response.data.message);
        }
      }
    } catch (e: any) {
      if (e.response?.data?.validation_error) {
        const fieldErrors: { [key: string]: string } = {};
        e.response.data.errors.forEach((err: any) => {
          fieldErrors[err.field] = err.message;
        });
        setValidationErrors(fieldErrors);
      } else {
        setError(e.response?.data?.message || translang.network_error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '400px', padding: '24px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px' }}>{translang.add_opening_stock_title}</h2>
        {error && (
          <div style={{ marginBottom: '16px', padding: '12px', color: 'var(--error-color)', background: '#fee', borderRadius: '4px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">{translang.date}</label>
            <Input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            {validationErrors.date && (
              <div style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.date}
              </div>
            )}
          </div>
          <div className="input-group">
            <label className="input-label">{translang.select_item}</label>
            <Select 
              value={formData.item_id}
              onChange={(value) => setFormData({ ...formData, item_id: value as string })}
              options={items.map(i => ({ value: String(i.id), label: i.name }))}
              placeholder={`-- ${translang.select_item} --`}
            />
            {validationErrors.item_id && (
              <div style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.item_id}
              </div>
            )}
          </div>
          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label className="input-label">{translang.quantity}</label>
            <Input 
              type="text"
              value={formData.qty}
              placeholder="0.000"
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d*\.?\d{0,3}$/.test(val)) {
                  setFormData({ ...formData, qty: val });
                }
              }}
            />
            {validationErrors.qty && (
              <div style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.qty}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn" onClick={onClose} style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', color: 'var(--foreground-color)' }}>
              {translang.cancel}
            </button>
            <button type="submit" className="btn btn-primary">
              {isSubmitting ? translang.saving : translang.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOpeningStockModal;
