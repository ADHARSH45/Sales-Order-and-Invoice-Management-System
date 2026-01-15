const orderState = {
  orders: [],
};

/* ---------- UI ELEMENTS ---------- */
const ui = {
  loading: () => document.getElementById('loadingState'),
  error: () => document.getElementById('errorState'),
  errorMessage: () => document.getElementById('errorMessage'),
  empty: () => document.getElementById('emptyState'),
  table: () => document.getElementById('tableState'),
  tbody: () => document.getElementById('ordersTableBody'),
};

/* ---------- UI STATES ---------- */
function hideAll() {
  ui.loading().classList.add('hidden');
  ui.error().classList.add('hidden');
  ui.empty().classList.add('hidden');
  ui.table().classList.add('hidden');
}

function showLoading() {
  hideAll();
  ui.loading().classList.remove('hidden');
}

function showError(msg) {
  hideAll();
  ui.errorMessage().textContent = msg;
  ui.error().classList.remove('hidden');
}

function showEmpty() {
  hideAll();
  ui.empty().classList.remove('hidden');
}

function showTable() {
  hideAll();
  ui.table().classList.remove('hidden');
}

/* ---------- HELPERS ---------- */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

/* ---------- RENDER ---------- */
function renderOrderRow(order) {
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td class="px-6 py-4">#${order.id}</td>
    <td class="px-6 py-4">${order.customer_name}</td>
    <td class="px-6 py-4 text-center">${order.items.length}</td>
    <td class="px-6 py-4 text-right">
      ${formatCurrency(order.total_amount)}
    </td>
    <td class="px-6 py-4 text-center">
      ${new Date(order.created_at).toLocaleDateString()}
    </td>
    <td class="px-6 py-4 text-center">
      <button
        onclick="goToOrderSummary(${order.id})"
        class="px-3 py-1 bg-green-100 text-green-700 rounded text-xs">
        Summary
      </button>
    </td>
  `;

  return tr;
}

function renderTable() {
  ui.tbody().innerHTML = '';
  orderState.orders.forEach(order => {
    ui.tbody().appendChild(renderOrderRow(order));
  });
}

/* ---------- LOAD ORDERS ---------- */
async function loadOrders() {
  showLoading();
  try {
    const orders = await apiClient.orders.getAll();
    orderState.orders = orders;

    if (!orders.length) {
      showEmpty();
    } else {
      renderTable();
      showTable();
    }
  } catch (err) {
    showError(err.message || 'Failed to load orders');
  }
}

/* ---------- NAV ---------- */
function goToOrderSummary(orderId) {
  window.location.href = `order-summary.html?order_id=${orderId}`;
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', loadOrders);