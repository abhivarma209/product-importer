'use client';

import { useState } from 'react';
import ProductsTab from '@/components/ProductsTab';
import UploadTab from '@/components/UploadTab';
import WebhooksTab from '@/components/WebhooksTab';
import Toast from '@/components/Toast';

export default function Home() {
  const [activeTab, setActiveTab] = useState('products');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (message: string, type: string = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="container">
      <header>
        <h1>🚀 Acme Product Importer</h1>
        <p className="subtitle">Scalable product management and CSV import system</p>
      </header>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload CSV
        </button>
        <button
          className={`tab-btn ${activeTab === 'webhooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('webhooks')}
        >
          Webhooks
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'products' && <ProductsTab showToast={showToast} />}
        {activeTab === 'upload' && <UploadTab showToast={showToast} />}
        {activeTab === 'webhooks' && <WebhooksTab showToast={showToast} />}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

