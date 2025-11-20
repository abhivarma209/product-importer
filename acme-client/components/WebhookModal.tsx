'use client';

import { useState, useEffect } from 'react';
import { webhooksApi } from '@/lib/api';
import { Webhook } from '@/types';

interface WebhookModalProps {
  webhook: Webhook | null;
  onClose: () => void;
  onSave: () => void;
  showToast: (message: string, type: string) => void;
}

export default function WebhookModal({ webhook, onClose, onSave, showToast }: WebhookModalProps) {
  const [formData, setFormData] = useState({
    url: '',
    event_type: 'product.created',
    description: '',
    enabled: true,
  });

  useEffect(() => {
    if (webhook) {
      setFormData({
        url: webhook.url,
        event_type: webhook.event_type,
        description: webhook.description || '',
        enabled: webhook.enabled,
      });
    }
  }, [webhook]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (webhook) {
        await webhooksApi.update(webhook.id, formData);
        showToast('Webhook updated successfully', 'success');
      } else {
        await webhooksApi.create(formData);
        showToast('Webhook created successfully', 'success');
      }
      onSave();
    } catch (error) {
      showToast('Error saving webhook', 'error');
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{webhook ? 'Edit Webhook' : 'Add Webhook'}</h2>
          <button className="close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-group">
            <label htmlFor="url">Webhook URL *</label>
            <input
              type="url"
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/webhook"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="event_type">Event Type *</label>
            <select
              id="event_type"
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              required
            >
              <option value="product.created">Product Created</option>
              <option value="product.updated">Product Updated</option>
              <option value="product.deleted">Product Deleted</option>
              <option value="product.imported">Product Imported</option>
              <option value="products.bulk_deleted">Products Bulk Deleted</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              />
              Enabled
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

