'use client';

import { useState, useEffect } from 'react';
import { webhooksApi } from '@/lib/api';
import { Webhook } from '@/types';
import WebhookModal from './WebhookModal';

interface WebhooksTabProps {
  showToast: (message: string, type: string) => void;
}

export default function WebhooksTab({ showToast }: WebhooksTabProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    setLoading(true);
    try {
      const response = await webhooksApi.getAll();
      setWebhooks(response.data);
    } catch (error) {
      showToast('Error loading webhooks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      await webhooksApi.delete(id);
      showToast('Webhook deleted successfully', 'success');
      loadWebhooks();
    } catch (error) {
      showToast('Error deleting webhook', 'error');
    }
  };

  const handleTest = async (id: number) => {
    try {
      const response = await webhooksApi.test(id);
      const result = response.data;

      if (result.success) {
        showToast(
          `Webhook test successful! Status: ${result.status_code}, Response time: ${result.response_time_ms}ms`,
          'success'
        );
      } else {
        showToast(`Webhook test failed: ${result.message}`, 'error');
      }
    } catch (error) {
      showToast('Error testing webhook', 'error');
    }
  };

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingWebhook(null);
    setShowModal(true);
  };

  const handleSave = () => {
    setShowModal(false);
    loadWebhooks();
  };

  return (
    <>
      <div className="section-header">
        <h2>Webhook Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Webhook
        </button>
      </div>

      <div>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>Loading...</p>
        ) : webhooks.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>No webhooks configured</p>
        ) : (
          webhooks.map((webhook) => (
            <div key={webhook.id} className="webhook-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#667eea', wordBreak: 'break-all' }}>
                    {webhook.url}
                  </div>
                  {webhook.description && (
                    <p style={{ color: '#6c757d', marginTop: '5px' }}>{webhook.description}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button className="btn btn-success btn-small" onClick={() => handleTest(webhook.id)}>
                    Test
                  </button>
                  <button className="btn btn-secondary btn-small" onClick={() => handleEdit(webhook)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => handleDelete(webhook.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ fontWeight: 600, color: '#6c757d' }}>Event:</span>
                  <span>{webhook.event_type}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ fontWeight: 600, color: '#6c757d' }}>Status:</span>
                  <span className={`status-badge ${webhook.enabled ? 'status-active' : 'status-inactive'}`}>
                    {webhook.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <WebhookModal
          webhook={editingWebhook}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          showToast={showToast}
        />
      )}
    </>
  );
}

