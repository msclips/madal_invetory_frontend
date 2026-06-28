import React, { useState, useEffect } from 'react';
import { getUnitAutocomplete } from '../services/unitService';
import { storeItem } from '../services/itemService';
import { useTranslate } from '../config/translate/translateContext';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { translang } = useTranslate();
  const [units, setUnits] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({ name: '', unit_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen && units.length === 0) {
      fetchUnits();
    }
  }, [isOpen]);

  const fetchUnits = async () => {
    try {
      const response = await getUnitAutocomplete();
      if (response.data.status) {
        setUnits(response.data.data);
      }
    } catch (e) {
      console.error('Failed to load units', e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend Validation
    const errors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      errors.name = translang.validation_name_required;
    }
    if (!formData.unit_id) {
      errors.unit_id = translang.validation_unit_required;
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setValidationErrors({});
    
    try {
      const response = await storeItem({ name: formData.name, unit_id: Number(formData.unit_id) });
      if (response.data.status) {
        setFormData({ name: '', unit_id: '' });
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
        <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px' }}>{translang.add_item_title}</h2>
        {error && (
          <div style={{ marginBottom: '16px', padding: '12px', color: 'var(--error-color)', background: '#fee', borderRadius: '4px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">{translang.item_name}</label>
            <Input 
              type="text" 
              value={formData.name}
              placeholder={translang.item_name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {validationErrors.name && (
              <div style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.name}
              </div>
            )}
          </div>
          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label className="input-label">{translang.select_unit}</label>
            <Select 
              value={formData.unit_id}
              onChange={(value) => setFormData({ ...formData, unit_id: value as string })}
              options={units.map(u => ({ value: String(u.id), label: u.name }))}
              placeholder={`-- ${translang.select_unit} --`}
            />
            {validationErrors.unit_id && (
              <div style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.unit_id}
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

export default AddItemModal;
