// Global state
let currentPage = 0;
let pageSize = 50;
let totalProducts = 0;
let currentTaskId = null;
let progressInterval = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    loadProducts();
    loadWebhooks();
    initFileUpload();
    initForms();
});

// Tab Management
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Refresh data when switching tabs
    if (tabName === 'products') {
        loadProducts();
    } else if (tabName === 'webhooks') {
        loadWebhooks();
    }
}

// ============================================================================
// PRODUCTS
// ============================================================================

async function loadProducts() {
    const search = document.getElementById('search-input').value;
    const active = document.getElementById('active-filter').value;
    
    try {
        const params = new URLSearchParams({
            skip: currentPage * pageSize,
            limit: pageSize
        });
        
        if (search) params.append('search', search);
        if (active) params.append('active', active);
        
        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();
        
        totalProducts = data.total;
        renderProducts(data.items);
        updatePagination();
    } catch (error) {
        showToast('Error loading products', 'error');
        console.error(error);
    }
}

function renderProducts(products) {
    const tbody = document.getElementById('products-tbody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><strong>${escapeHtml(product.sku)}</strong></td>
            <td>${escapeHtml(product.name)}</td>
            <td>${escapeHtml(product.description || '-')}</td>
            <td>${product.price ? '$' + product.price.toFixed(2) : '-'}</td>
            <td>
                <span class="status-badge ${product.active ? 'status-active' : 'status-inactive'}">
                    ${product.active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="btn btn-secondary btn-small" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updatePagination() {
    const totalPages = Math.ceil(totalProducts / pageSize);
    document.getElementById('page-info').textContent = 
        `Page ${currentPage + 1} of ${totalPages} (${totalProducts} total)`;
    
    document.getElementById('prev-btn').disabled = currentPage === 0;
    document.getElementById('next-btn').disabled = (currentPage + 1) >= totalPages;
}

function nextPage() {
    const totalPages = Math.ceil(totalProducts / pageSize);
    if (currentPage < totalPages - 1) {
        currentPage++;
        loadProducts();
    }
}

function previousPage() {
    if (currentPage > 0) {
        currentPage--;
        loadProducts();
    }
}

function showProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    
    if (product) {
        document.getElementById('product-modal-title').textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-sku').value = product.sku;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-active').checked = product.active;
    } else {
        document.getElementById('product-modal-title').textContent = 'Add Product';
        form.reset();
        document.getElementById('product-id').value = '';
    }
    
    modal.classList.add('show');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('show');
}

async function editProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();
        showProductModal(product);
    } catch (error) {
        showToast('Error loading product', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Product deleted successfully', 'success');
            loadProducts();
        } else {
            showToast('Error deleting product', 'error');
        }
    } catch (error) {
        showToast('Error deleting product', 'error');
    }
}

async function confirmBulkDelete() {
    const confirmed = confirm(
        'Are you sure you want to delete ALL products? This action cannot be undone!'
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = confirm(
        'This will permanently delete all products from the database. Are you absolutely sure?'
    );
    
    if (!doubleConfirm) return;
    
    try {
        const response = await fetch('/api/products', {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast(`Successfully deleted ${data.count} products`, 'success');
            loadProducts();
        } else {
            showToast('Error deleting products', 'error');
        }
    } catch (error) {
        showToast('Error deleting products', 'error');
    }
}

// ============================================================================
// FILE UPLOAD
// ============================================================================

function initFileUpload() {
    const fileInput = document.getElementById('file-input');
    const uploadBox = document.getElementById('upload-box');
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#5568d3';
    });
    
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = '#667eea';
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#667eea';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

async function handleFile(file) {
    if (!file.name.endsWith('.csv')) {
        showToast('Please select a CSV file', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        // Show progress section
        document.getElementById('upload-progress').classList.remove('hidden');
        document.getElementById('upload-box').style.display = 'none';
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentTaskId = data.task_id;
            showToast('Upload started successfully', 'success');
            startProgressPolling();
        } else {
            showToast('Error uploading file', 'error');
            resetUploadUI();
        }
    } catch (error) {
        showToast('Error uploading file', 'error');
        resetUploadUI();
    }
}

function startProgressPolling() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    progressInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/upload/status/${currentTaskId}`);
            const data = await response.json();
            
            updateProgress(data);
            
            if (data.status === 'completed' || data.status === 'failed') {
                clearInterval(progressInterval);
                
                if (data.status === 'completed') {
                    showToast('Import completed successfully!', 'success');
                    setTimeout(resetUploadUI, 3000);
                } else {
                    showToast(`Import failed: ${data.message}`, 'error');
                    setTimeout(resetUploadUI, 5000);
                }
            }
        } catch (error) {
            console.error('Error polling progress:', error);
        }
    }, 1000);
}

function updateProgress(data) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const progressDetails = document.getElementById('progress-details');
    
    progressFill.style.width = `${data.percentage}%`;
    progressText.textContent = `${data.status}: ${data.percentage}%`;
    
    if (data.total > 0) {
        progressDetails.textContent = `Processed ${data.current.toLocaleString()} of ${data.total.toLocaleString()} rows`;
    } else {
        progressDetails.textContent = data.message || 'Processing...';
    }
}

function resetUploadUI() {
    document.getElementById('upload-progress').classList.add('hidden');
    document.getElementById('upload-box').style.display = 'block';
    document.getElementById('file-input').value = '';
    document.getElementById('progress-fill').style.width = '0%';
    currentTaskId = null;
}

// ============================================================================
// WEBHOOKS
// ============================================================================

async function loadWebhooks() {
    try {
        const response = await fetch('/api/webhooks');
        const webhooks = await response.json();
        renderWebhooks(webhooks);
    } catch (error) {
        showToast('Error loading webhooks', 'error');
    }
}

function renderWebhooks(webhooks) {
    const container = document.getElementById('webhooks-list');
    
    if (webhooks.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #6c757d;">No webhooks configured</p>';
        return;
    }
    
    container.innerHTML = webhooks.map(webhook => `
        <div class="webhook-card">
            <div class="webhook-header">
                <div>
                    <div class="webhook-url">${escapeHtml(webhook.url)}</div>
                    ${webhook.description ? `<p style="color: #6c757d; margin-top: 5px;">${escapeHtml(webhook.description)}</p>` : ''}
                </div>
                <div class="webhook-actions">
                    <button class="btn btn-success btn-small" onclick="testWebhook(${webhook.id})">Test</button>
                    <button class="btn btn-secondary btn-small" onclick="editWebhook(${webhook.id})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteWebhook(${webhook.id})">Delete</button>
                </div>
            </div>
            <div class="webhook-info">
                <div class="webhook-row">
                    <span class="webhook-label">Event:</span>
                    <span>${escapeHtml(webhook.event_type)}</span>
                </div>
                <div class="webhook-row">
                    <span class="webhook-label">Status:</span>
                    <span class="status-badge ${webhook.enabled ? 'status-active' : 'status-inactive'}">
                        ${webhook.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function showWebhookModal(webhook = null) {
    const modal = document.getElementById('webhook-modal');
    const form = document.getElementById('webhook-form');
    
    if (webhook) {
        document.getElementById('webhook-modal-title').textContent = 'Edit Webhook';
        document.getElementById('webhook-id').value = webhook.id;
        document.getElementById('webhook-url').value = webhook.url;
        document.getElementById('webhook-event').value = webhook.event_type;
        document.getElementById('webhook-description').value = webhook.description || '';
        document.getElementById('webhook-enabled').checked = webhook.enabled;
    } else {
        document.getElementById('webhook-modal-title').textContent = 'Add Webhook';
        form.reset();
        document.getElementById('webhook-id').value = '';
    }
    
    modal.classList.add('show');
}

function closeWebhookModal() {
    document.getElementById('webhook-modal').classList.remove('show');
}

async function editWebhook(webhookId) {
    try {
        const response = await fetch('/api/webhooks');
        const webhooks = await response.json();
        const webhook = webhooks.find(w => w.id === webhookId);
        
        if (webhook) {
            showWebhookModal(webhook);
        }
    } catch (error) {
        showToast('Error loading webhook', 'error');
    }
}

async function deleteWebhook(webhookId) {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    
    try {
        const response = await fetch(`/api/webhooks/${webhookId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Webhook deleted successfully', 'success');
            loadWebhooks();
        } else {
            showToast('Error deleting webhook', 'error');
        }
    } catch (error) {
        showToast('Error deleting webhook', 'error');
    }
}

async function testWebhook(webhookId) {
    try {
        const response = await fetch(`/api/webhooks/${webhookId}/test`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(`Webhook test successful! Status: ${result.status_code}, Response time: ${result.response_time_ms}ms`, 'success');
        } else {
            showToast(`Webhook test failed: ${result.message}`, 'error');
        }
    } catch (error) {
        showToast('Error testing webhook', 'error');
    }
}

// ============================================================================
// FORMS
// ============================================================================

function initForms() {
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    document.getElementById('webhook-form').addEventListener('submit', handleWebhookSubmit);
}

async function handleProductSubmit(event) {
    event.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const productData = {
        sku: document.getElementById('product-sku').value,
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value || null,
        price: parseFloat(document.getElementById('product-price').value) || null,
        active: document.getElementById('product-active').checked
    };
    
    try {
        const url = productId ? `/api/products/${productId}` : '/api/products';
        const method = productId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            showToast(`Product ${productId ? 'updated' : 'created'} successfully`, 'success');
            closeProductModal();
            loadProducts();
        } else {
            const error = await response.json();
            showToast(error.detail || 'Error saving product', 'error');
        }
    } catch (error) {
        showToast('Error saving product', 'error');
    }
}

async function handleWebhookSubmit(event) {
    event.preventDefault();
    
    const webhookId = document.getElementById('webhook-id').value;
    const webhookData = {
        url: document.getElementById('webhook-url').value,
        event_type: document.getElementById('webhook-event').value,
        description: document.getElementById('webhook-description').value || null,
        enabled: document.getElementById('webhook-enabled').checked
    };
    
    try {
        const url = webhookId ? `/api/webhooks/${webhookId}` : '/api/webhooks';
        const method = webhookId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookData)
        });
        
        if (response.ok) {
            showToast(`Webhook ${webhookId ? 'updated' : 'created'} successfully`, 'success');
            closeWebhookModal();
            loadWebhooks();
        } else {
            showToast('Error saving webhook', 'error');
        }
    } catch (error) {
        showToast('Error saving webhook', 'error');
    }
}

// ============================================================================
// UTILITIES
// ============================================================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
});

