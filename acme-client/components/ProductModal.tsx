'use client';

import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
  showToast: (message: string, type: string) => void;
}

export default function ProductModal({ product, onClose, onSave, showToast }: ProductModalProps) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    active: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        price: product.price?.toString() || '',
        active: product.active,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
      };

      if (product) {
        await productsApi.update(product.id, data);
        showToast('Product updated successfully', 'success');
      } else {
        await productsApi.create(data);
        showToast('Product created successfully', 'success');
      }
      onSave();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error saving product';
      showToast(message, 'error');
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
          <button className="close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-group">
            <label htmlFor="sku">SKU *</label>
            <input
              type="text"
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              type="number"
              id="price"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              Active
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

