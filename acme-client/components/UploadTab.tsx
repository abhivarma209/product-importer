'use client';

import { useState, useRef } from 'react';
import { uploadApi } from '@/lib/api';

interface UploadTabProps {
  showToast: (message: string, type: string) => void;
}

export default function UploadTab({ showToast }: UploadTabProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [details, setDetails] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      showToast('Please select a CSV file', 'error');
      return;
    }

    setUploading(true);
    setProgress(0);
    setStatus('Uploading...');

    try {
      const response = await uploadApi.uploadCsv(file);
      const uploadTaskId = response.data.task_id;
      setTaskId(uploadTaskId);
      showToast('Upload started successfully', 'success');
      startProgressPolling(uploadTaskId);
    } catch (error) {
      showToast('Error uploading file', 'error');
      resetUpload();
    }
  };

  const startProgressPolling = (uploadTaskId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await uploadApi.getStatus(uploadTaskId);
        const data = response.data;

        setProgress(data.percentage);
        setStatus(data.status);
        
        if (data.total > 0) {
          setDetails(`Processed ${data.current.toLocaleString()} of ${data.total.toLocaleString()} rows`);
        } else {
          setDetails(data.message || 'Processing...');
        }

        if (data.status === 'completed') {
          clearInterval(interval);
          showToast('Import completed successfully!', 'success');
          setTimeout(resetUpload, 3000);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          showToast(`Import failed: ${data.message}`, 'error');
          setTimeout(resetUpload, 5000);
        }
      } catch (error) {
        console.error('Error polling progress:', error);
      }
    }, 1000);
  };

  const resetUpload = () => {
    setUploading(false);
    setProgress(0);
    setStatus('');
    setDetails('');
    setTaskId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <div className="section-header">
        <h2>Upload CSV File</h2>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {!uploading ? (
          <div
            className="upload-box"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="upload-icon">📁</div>
            <p>Drag and drop your CSV file here, or click to browse</p>
            <p style={{ color: '#6c757d', margin: '10px 0 20px' }}>
              Supports CSV files up to 500,000 records
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button className="btn btn-primary" type="button">
              Select File
            </button>
          </div>
        ) : (
          <div style={{ padding: '25px', background: '#f8f9fa', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Upload Progress</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}>
                {progress}%
              </div>
            </div>
            <p style={{ fontSize: '1.2em', fontWeight: 600, color: '#333', marginBottom: '5px' }}>
              {status}: {progress}%
            </p>
            <p style={{ color: '#6c757d' }}>{details}</p>
          </div>
        )}

        <div style={{ marginTop: '30px', padding: '20px', background: '#e7f3ff', borderLeft: '4px solid #667eea', borderRadius: '6px' }}>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>CSV Format Requirements</h3>
          <p>Your CSV file should contain the following columns:</p>
          <ul style={{ margin: '10px 0 10px 20px' }}>
            <li><strong>sku</strong> - Unique product identifier (case-insensitive)</li>
            <li><strong>name</strong> - Product name</li>
            <li><strong>description</strong> - Product description (optional)</li>
            <li><strong>price</strong> - Product price (optional)</li>
          </ul>
          <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#6c757d' }}>
            Note: Duplicate SKUs will be automatically overwritten. All products are marked as active by default.
          </p>
        </div>
      </div>
    </>
  );
}

