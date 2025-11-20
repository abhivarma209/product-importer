'use client';

import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import ProductModal from './ProductModal';

interface ProductsTabProps {
  showToast: (message: string, type: string) => void;
}

export default function ProductsTab({ showToast }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        skip: page * pageSize,
        limit: pageSize,
      };
      if (search) params.search = search;
      if (activeFilter) params.active = activeFilter === 'true';

      const response = await productsApi.getAll(params);
      setProducts(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      showToast('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsApi.delete(id);
      showToast('Product deleted successfully', 'success');
      loadProducts();
    } catch (error) {
      showToast('Error deleting product', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete ALL products? This cannot be undone!')) return;
    if (!confirm('This will permanently delete all products. Are you absolutely sure?')) return;

    try {
      const response = await productsApi.bulkDelete();
      showToast(`Successfully deleted ${response.data.count} products`, 'success');
      loadProducts();
    } catch (error) {
      showToast('Error deleting products', 'error');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleSave = () => {
    setShowModal(false);
    loadProducts();
  };

  const handleExportToExcel = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (activeFilter) params.active = activeFilter === 'true';

      const response = await productsApi.exportToExcel(params);
      
      // Create blob and download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products_export_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast('Products exported to Excel successfully!', 'success');
    } catch (error) {
      showToast('Failed to export products', 'error');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className="section-header">
        <h2>Product Management</h2>
        <div className="actions">
          <button className="btn btn-success" onClick={handleExportToExcel}>
            📊 Export to Excel
          </button>
          <button className="btn btn-primary" onClick={handleAdd}>
            + Add Product
          </button>
          <button className="btn btn-danger" onClick={handleBulkDelete}>
            Delete All
          </button>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by SKU, name, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
        <button className="btn btn-secondary" onClick={() => {setPage(0); loadProducts();}}>
          Search
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>SKU</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td><strong>{product.sku}</strong></td>
                  <td>{product.name}</td>
                  <td>{product.description || '-'}</td>
                  <td>{product.price ? `$${product.price.toFixed(2)}` : '-'}</td>
                  <td>
                    <span className={`status-badge ${product.active ? 'status-active' : 'status-inactive'}`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>{' '}
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="btn btn-secondary"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          Previous
        </button>
        <span>Page {page + 1} of {totalPages} ({total} total)</span>
        <button
          className="btn btn-secondary"
          onClick={() => setPage(page + 1)}
          disabled={page + 1 >= totalPages}
        >
          Next
        </button>
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          showToast={showToast}
        />
      )}
    </>
  );
}

