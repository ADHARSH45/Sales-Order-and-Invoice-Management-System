const invoiceState = {
  invoices: [],
  filteredInvoices: [],
  currentInvoice: null,
};

const invoiceUIElements = {
  loadingState: () => document.getElementById('loadingState'),
  errorState: () => document.getElementById('errorState'),
  errorMessage: () => document.getElementById('errorMessage'),
  tableState: () => document.getElementById('tableState'),
  emptyState: () => document.getElementById('emptyState'),
  invoiceTableBody: () => document.getElementById('invoiceTableBody'),
  searchInput: () => document.getElementById('searchInput'),
  customerFilter: () => document.getElementById('customerFilter'),
  invoiceModal: () => document.getElementById('invoiceModal'),
  modalTitle: () => document.getElementById('modalTitle'),
  invoiceContent: () => document.getElementById('invoiceContent'),
};

/* ------------------ UI STATE ------------------ */

function hideAllStates() {
  invoiceUIElements.loadingState().classList.add('hidden');
  invoiceUIElements.errorState().classList.add('hidden');
  invoiceUIElements.tableState().classList.add('hidden');
  invoiceUIElements.emptyState().classList.add('hidden');
}

function showTable() {
  hideAllStates();
  invoiceUIElements.tableState().classList.remove('hidden');
}

function showEmpty() {
  hideAllStates();
  invoiceUIElements.emptyState().classList.remove('hidden');
}

function showError(msg) {
  hideAllStates();
  invoiceUIElements.errorMessage().textContent = msg;
  invoiceUIElements.errorState().classList.remove('hidden');
}

function showLoading() {
  hideAllStates();
  invoiceUIElements.loadingState().classList.remove('hidden');
}

/* ------------------ HELPERS ------------------ */

function formatCurrency(val) {
  return `₹ ${Number(val || 0).toFixed(2)}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

/* ------------------ FILTER ------------------ */

function populateCustomerFilter() {
  const select = invoiceUIElements.customerFilter();
  select.innerHTML = `<option value="">All Customers</option>`;

  const uniqueCustomers = new Map();

  invoiceState.invoices.forEach(inv => {
    uniqueCustomers.set(inv.customer_name, inv.customer_name);
  });

  uniqueCustomers.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

function applyFilters() {
  const q = invoiceUIElements.searchInput().value.toLowerCase();
  const customer = invoiceUIElements.customerFilter().value;

  invoiceState.filteredInvoices = invoiceState.invoices.filter(inv => {
    const matchId = inv.invoice_id.toLowerCase().includes(q);
    const matchCustomer = !customer || inv.customer_name === customer;
    return matchId && matchCustomer;
  });

  if (invoiceState.filteredInvoices.length === 0) {
    showEmpty();
  } else {
    renderInvoiceTable();
    showTable();
  }
}

/* ------------------ TABLE ------------------ */

function renderInvoiceRow(invoice) {
  const row = document.createElement('tr');
  row.className = 'hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0';

  row.innerHTML = `
    <td class="px-6 py-4 text-sm font-semibold text-gray-900">
      ${invoice.invoice_id}
    </td>

    <td class="px-6 py-4 text-sm text-gray-600">
      #${invoice.order_id}
    </td>

    <td class="px-6 py-4 text-sm text-gray-600">
      ${invoice.customer_name}
    </td>

    <td class="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
      ${formatCurrency(invoice.total_amount)}
    </td>

   

    <!-- ACTION -->
    <td class="px-6 py-4 text-center">
      <button
        onclick="viewInvoiceDetails('${invoice.invoice_id}')"
        class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
      >
        View Details
      </button>
    </td>
     <!-- PAYMENT STATUS -->
    <td class="px-6 py-4 text-center">
      <span class="px-2 py-1 rounded text-xs font-semibold
        ${invoice.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
        ${invoice.paid ? 'PAID' : 'UNPAID'}
      </span>
    </td>
  `;

  return row;
}


function renderInvoiceTable() {
  const tbody = invoiceUIElements.invoiceTableBody();
  tbody.innerHTML = '';
  invoiceState.filteredInvoices.forEach(inv =>
    tbody.appendChild(renderInvoiceRow(inv))
  );
}

/* ------------------ MODAL ------------------ */

function viewInvoiceDetails(id) {
  const inv = invoiceState.invoices.find(i => i.invoice_id === id);
  if (!inv) return;

  invoiceState.currentInvoice = inv;
  renderInvoiceModal(inv);
  invoiceUIElements.invoiceModal().classList.remove('hidden');
}

function renderInvoiceModal(inv) {
  invoiceUIElements.modalTitle().textContent = inv.invoice_id;

  invoiceUIElements.invoiceContent().innerHTML = `
    <p><b>Order:</b> #${inv.order_id}</p>
    <p><b>Customer:</b> ${inv.customer_name}</p>
    <p><b>Status:</b> ${inv.paid ? 'PAID' : 'UNPAID'}</p>
    <hr class="my-3" />
    ${(inv.items || []).map(i => `
      <div class="flex justify-between">
        <span>${i.product_name}</span>
        <span>${i.quantity} × ${formatCurrency(i.price)}</span>
      </div>
    `).join('')}
    <hr class="my-3" />
    <div class="text-right font-bold">
      Total: ${formatCurrency(inv.total_amount)}
    </div>
  `;
}

/* ------------------ INIT ------------------ */

async function initializeInvoices() {
  showLoading();

  try {
    await dataCache.loadAll();

    invoiceState.invoices = dataCache.orders.map(o => ({
      invoice_id: `INV-${o.id}`,
      order_id: o.id,
      customer_name: o.customer_name,
      total_amount: o.total_amount,
      paid: o.order_paid,
      created_at: o.created_at,
      items: o.items || [],
    }));

    populateCustomerFilter();

    invoiceUIElements.searchInput().addEventListener('input', applyFilters);
    invoiceUIElements.customerFilter().addEventListener('change', applyFilters);

    invoiceState.filteredInvoices = [...invoiceState.invoices];

    if (invoiceState.filteredInvoices.length === 0) {
      showEmpty();
    } else {
      renderInvoiceTable();
      showTable();
    }
  } catch (err) {
    console.error(err);
    showError('Failed to load invoices');
  }
}

document.addEventListener('DOMContentLoaded', initializeInvoices);
