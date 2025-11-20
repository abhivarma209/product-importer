export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price?: number;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProductCreate {
  sku: string;
  name: string;
  description?: string;
  price?: number;
  active: boolean;
}

export interface Webhook {
  id: number;
  url: string;
  event_type: string;
  enabled: boolean;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface UploadTask {
  id: number;
  task_id: string;
  filename: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  error_message?: string;
  created_at: string;
}

export interface TaskStatus {
  status: string;
  current: number;
  total: number;
  percentage: number;
  message?: string;
}

