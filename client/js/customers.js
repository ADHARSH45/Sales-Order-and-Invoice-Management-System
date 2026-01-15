const customerState = {
  customers: [],
  isLoading: true,
  hasError: false,
  editingId: null,
};

const customerUIElements = {
  loadingState: () => document.getElementById('loadingState'),
  errorState: () => document.getElementById('errorState'),
  errorMessage: () => document.getElementById('errorMessage'),
  tableState: () => document.getElementById('tableState'),
  emptyState: () => document.getElementById('emptyState'),
  customersTableBody: () => document.getElementById('customersTableBody'),
  customerModal: () => document.getElementById('customerModal'),
  modalTitle: () => document.getElementById('modalTitle'),
  customerForm: () => document.getElementById('customerForm'),
  customerId: () => document.getElementById('customerId'),
  customerName: () => document.getElementById('customerName'),
  customerEmail: () => document.getElementById('customerEmail'),
  customerPhone: () => document.getElementById('customerPhone'),
};

function hideAllCustomerStates() {
  customerUIElements.loadingState().classList.add('hidden');
  customerUIElements.errorState().classList.add('hidden');
  customerUIElements.tableState().classList.add('hidden');
  customerUIElements.emptyState().classList.add('hidden');
}

function showCustomerLoadingState() {
  hideAllCustomerStates();
  customerUIElements.loadingState().classList.remove('hidden');
  customerState.isLoading = true;
}

function showCustomerErrorState(message) {
  hideAllCustomerStates();
  customerUIElements.errorMessage().textContent = message || 'Failed to load customers.';
  customerUIElements.errorState().classList.remove('hidden');
  customerState.hasError = true;
}

function showCustomerEmptyState() {
  hideAllCustomerStates();
  customerUIElements.emptyState().classList.remove('hidden');
}

function showCustomerTable() {
  hideAllCustomerStates();
  customerUIElements.tableState().classList.remove('hidden');
}

function renderCustomerRow(customer) {
  const row = document.createElement('tr');
  row.className = 'hover:bg-gray-50 transition-colors';
  row.innerHTML = `
    <td class="px-6 py-4 text-sm text-gray-600">#${customer.id}</td>
    <td class="px-6 py-4 text-sm font-semibold text-gray-900">${customer.name}</td>
    <td class="px-6 py-4 text-sm text-gray-600">${customer.email || '-'}</td>
    <td class="px-6 py-4 text-sm text-gray-600">${customer.phone || '-'}</td>
    <td class="px-6 py-4 text-center space-x-2">
      <button onclick="openEditCustomerModal(${customer.id})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors">
        Edit
      </button>
      <button onclick="deleteCustomer(${customer.id})" class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors">
        Delete
      </button>
    </td>
  `;
  return row;
}

function renderCustomerTable() {
  const tableBody = customerUIElements.customersTableBody();
  tableBody.innerHTML = '';

  customerState.customers.forEach((customer) => {
    tableBody.appendChild(renderCustomerRow(customer));
  });
}

function openAddCustomerModal() {
  customerState.editingId = null;
  customerUIElements.modalTitle().textContent = 'Add Customer';
  customerUIElements.customerForm().reset();
  customerUIElements.customerId().value = '';
  customerUIElements.customerModal().classList.remove('hidden');
}

function openEditCustomerModal(id) {
  const customer = customerState.customers.find((c) => c.id === id);
  if (!customer) return;

  customerState.editingId = id;
  customerUIElements.modalTitle().textContent = 'Edit Customer';
  customerUIElements.customerId().value = customer.id;
  customerUIElements.customerName().value = customer.name;
  customerUIElements.customerEmail().value = customer.email || '';
  customerUIElements.customerPhone().value = customer.phone || '';
  customerUIElements.customerModal().classList.remove('hidden');
}

function closeCustomerModal() {
  customerUIElements.customerModal().classList.add('hidden');
  customerUIElements.customerForm().reset();
  customerState.editingId = null;
}

async function handleCustomerFormSubmit(e) {
  e.preventDefault();

  const id = customerUIElements.customerId().value;
  const data = {
    name: customerUIElements.customerName().value,
    email: customerUIElements.customerEmail().value,
    phone: customerUIElements.customerPhone().value,
  };

  try {
    if (id) {
      await apiClient.customers.update(parseInt(id), data);
    } else {
      await apiClient.customers.create(data);
    }

    closeCustomerModal();
    await loadCustomers();
  } catch (error) {
    console.error('Failed to save customer:', error);
    alert('Failed to save customer. Please try again.');
  }
}

async function deleteCustomer(id) {
  if (!confirm('Are you sure you want to delete this customer?')) return;

  try {
    await apiClient.customers.delete(id);
    await loadCustomers();
  } catch (error) {
    console.error('Failed to delete customer:', error);
    alert('Failed to delete customer. Please try again.');
  }
}

async function loadCustomers() {
  showCustomerLoadingState();

  try {
    const customers = await apiClient.customers.getAll();

    if (!Array.isArray(customers)) {
      throw new Error('Invalid customer data format');
    }

    customerState.customers = customers;

    if (customers.length === 0) {
      showCustomerEmptyState();
    } else {
      renderCustomerTable();
      showCustomerTable();
    }

    customerState.isLoading = false;
  } catch (error) {
    console.error('Customer load error:', error);
    showCustomerErrorState(error.message);
  }
}

function initializeCustomerPage() {
  customerUIElements.customerForm().addEventListener('submit', handleCustomerFormSubmit);
  loadCustomers();
}

document.addEventListener('DOMContentLoaded', initializeCustomerPage);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCustomerModal();
  }
});
