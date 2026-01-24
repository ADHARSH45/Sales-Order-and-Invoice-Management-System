const productState = {
  products: [],
  isLoading: true,
  hasError: false,
  editingId: null,
};

const productUIElements = {
  loadingState: () => document.getElementById('loadingState'),
  errorState: () => document.getElementById('errorState'),
  errorMessage: () => document.getElementById('errorMessage'),
  tableState: () => document.getElementById('tableState'),
  emptyState: () => document.getElementById('emptyState'),
  productsTableBody: () => document.getElementById('productsTableBody'),
  productModal: () => document.getElementById('productModal'),
  modalTitle: () => document.getElementById('modalTitle'),
  productForm: () => document.getElementById('productForm'),
  productId: () => document.getElementById('productId'),
  productName: () => document.getElementById('productName'),
  productDescription: () => document.getElementById('productDescription'),
  productPrice: () => document.getElementById('productPrice'),
  productStock: ()=> document.getElementById('productStock')
};

function hideAllProductStates() {
  productUIElements.loadingState().classList.add('hidden');
  productUIElements.errorState().classList.add('hidden');
  productUIElements.tableState().classList.add('hidden');
  productUIElements.emptyState().classList.add('hidden');
}

function showProductLoadingState() {
  hideAllProductStates();
  productUIElements.loadingState().classList.remove('hidden');
  productState.isLoading = true;
}

function showProductErrorState(message) {
  hideAllProductStates();
  productUIElements.errorMessage().textContent = message || 'Failed to load products.';
  productUIElements.errorState().classList.remove('hidden');
  productState.hasError = true;
}

function showProductEmptyState() {
  hideAllProductStates();
  productUIElements.emptyState().classList.remove('hidden');
}

function showProductTable() {
  hideAllProductStates();
  productUIElements.tableState().classList.remove('hidden');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

function renderProductRow(product) {
  const row = document.createElement('tr');
  row.className = 'hover:bg-gray-50 transition-colors';
  row.innerHTML = `
    <td class="px-6 py-4 text-sm text-gray-600">#${product.id}</td>
    <td class="px-6 py-4 text-sm font-semibold text-gray-900">${product.name}</td>
    <td class="px-6 py-4 text-sm text-gray-600">${product.stock|| '-'}</td>
    <td class="px-6 py-4 text-sm font-semibold text-gray-900 text-right">${formatCurrency(product.price)}</td>
    <td class="px-6 py-4 text-center space-x-2">
      <button onclick="openEditProductModal(${product.id})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors">
        Edit
      </button>
      <button onclick="deleteProduct(${product.id})" class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors">
        Delete
      </button>
    </td>
  `;
  return row;
}

function renderProductTable() {
  const tableBody = productUIElements.productsTableBody();
  tableBody.innerHTML = '';

  productState.products.forEach((product) => {
    tableBody.appendChild(renderProductRow(product));
  });
}

function openAddProductModal() {
  productState.editingId = null;
  productUIElements.modalTitle().textContent = 'Add Product';
  productUIElements.productForm().reset();
  productUIElements.productId().value = '';
  productUIElements.productModal().classList.remove('hidden');
}

function openEditProductModal(id) {
  const product = productState.products.find((p) => p.id === id);
  if (!product) return;

  productState.editingId = id;
  productUIElements.modalTitle().textContent = 'Edit Product';
  productUIElements.productId().value = product.id;
  productUIElements.productName().value = product.name;
  productUIElements.productDescription().value = product.description || '';
  productUIElements.productPrice().value = product.price;
  productUIElements.productStock().value = product.stock;
  productUIElements.productModal().classList.remove('hidden');
}

function closeProductModal() {
  productUIElements.productModal().classList.add('hidden');
  productUIElements.productForm().reset();
  productState.editingId = null;
}

async function handleProductFormSubmit(e) {
  e.preventDefault();

  const id = productUIElements.productId().value;
  const data = {
    name: productUIElements.productName().value,
    description: productUIElements.productDescription().value,
    price: parseFloat(productUIElements.productPrice().value),
    stock: productUIElements.productStock().value
  };

  try {
    if (id) {
      await apiClient.products.update(parseInt(id), data);
    } else {
      await apiClient.products.create(data);
    }

    closeProductModal();
    await loadProducts();
  } catch (error) {
    console.error('Failed to save product:', error);
    alert('Failed to save product. Please try again.');
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    await apiClient.products.delete(id);
    await loadProducts();
  } catch (error) {
    console.error('Failed to delete product:', error);
    alert('Failed to delete product. Please try again.');
  }
}

async function loadProducts() {
  showProductLoadingState();

  try {
    const products = await apiClient.products.getAll();

    if (!Array.isArray(products)) {
      throw new Error('Invalid product data format');
    }

    productState.products = products;

    if (products.length === 0) {
      showProductEmptyState();
    } else {
      renderProductTable();
      showProductTable();
    }

    productState.isLoading = false;
  } catch (error) {
    console.error('Product load error:', error);
    showProductErrorState(error.message);
  }
}

function initializeProductPage() {
  productUIElements.productForm().addEventListener('submit', handleProductFormSubmit);
  loadProducts();
}

document.addEventListener('DOMContentLoaded', initializeProductPage);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProductModal();
  }
});
