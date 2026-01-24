/* ================== STATE ================== */

const invoiceState = {
  invoices: [],
  filteredInvoices: [],
  currentInvoice: null,
};

/* ================== UI ELEMENTS ================== */

const invoiceUIElements = {
  loadingState: () => document.getElementById("loadingState"),
  errorState: () => document.getElementById("errorState"),
  errorMessage: () => document.getElementById("errorMessage"),
  tableState: () => document.getElementById("tableState"),
  emptyState: () => document.getElementById("emptyState"),
  invoiceTableBody: () => document.getElementById("invoiceTableBody"),
  customerFilter: () => document.getElementById("customerFilter"),
  searchInput: () => document.getElementById("searchInput"),
  invoiceModal: () => document.getElementById("invoiceModal"),
  invoiceContent: () => document.getElementById("invoiceContent"),
};

/* ================== UI STATES ================== */

function hideAllStates() {
  invoiceUIElements.loadingState().classList.add("hidden");
  invoiceUIElements.errorState().classList.add("hidden");
  invoiceUIElements.tableState().classList.add("hidden");
  invoiceUIElements.emptyState().classList.add("hidden");
}

function showLoading() {
  hideAllStates();
  invoiceUIElements.loadingState().classList.remove("hidden");
}

function showTable() {
  hideAllStates();
  invoiceUIElements.tableState().classList.remove("hidden");
}

function showEmpty() {
  hideAllStates();
  invoiceUIElements.emptyState().classList.remove("hidden");
}

function showError(msg) {
  hideAllStates();
  invoiceUIElements.errorMessage().textContent = msg;
  invoiceUIElements.errorState().classList.remove("hidden");
}

/* ================== HELPERS ================== */

function formatCurrency(val) {
  return `₹ ${Number(val || 0).toFixed(2)}`;
}

function formatDate(date) {
  return new Date(date).toLocaleString();
}
function populateCustomerFilter() {
  const select = invoiceUIElements.customerFilter();
  select.innerHTML = `<option value="">All Customers</option>`;

  const uniqueCustomers = [
    ...new Set(invoiceState.invoices.map(inv => inv.customer_name))
  ];

  uniqueCustomers.forEach(name => {
    const option = document.createElement("option");
    option.value = name.toLowerCase();
    option.textContent = name;
    select.appendChild(option);
  });
}


/* ================== FILTER ================== */

function applyFilters() {
  const searchQuery =
    invoiceUIElements.searchInput().value.trim().toLowerCase();

  const selectedCustomer =
    document.getElementById("customerFilter").value;

  invoiceState.filteredInvoices = invoiceState.invoices.filter(inv => {
    const matchesInvoiceId =
      String(inv.order_id).includes(searchQuery);

    const matchesCustomerSearch =
      inv.customer_name.toLowerCase().includes(searchQuery);

    const matchesCustomerDropdown =
      !selectedCustomer || inv.customer_name === selectedCustomer;

    return (
      (matchesInvoiceId || matchesCustomerSearch) &&
      matchesCustomerDropdown
    );
  });

  if (invoiceState.filteredInvoices.length === 0) {
    showEmpty();
  } else {
    renderInvoiceTable();
    showTable();
  }
}



/* ================== TABLE ================== */

function renderInvoiceRow(invoice) {
  const row = document.createElement("tr");
  row.className =
    "border-b hover:bg-gray-50 transition";

  row.innerHTML = `
    <td class="px-6 py-4 font-semibold">INV-${invoice.order_id}</td>
    <td class="px-6 py-4">#${invoice.order_id}</td>
    <td class="px-6 py-4">${invoice.customer_name}</td>
    <td class="px-6 py-4 text-right">${formatCurrency(invoice.total_amount)}</td>

    <td class="px-6 py-4 text-center">
      <span class="px-2 py-1 rounded text-xs font-semibold
        ${invoice.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}">
        ${invoice.paid ? "PAID" : "UNPAID"}
      </span>
    </td>

    <td class="px-6 py-4 text-center">
      <button
        onclick="viewInvoiceDetails(${invoice.order_id})"
        class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
        View Invoice
      </button>
    </td>
  `;

  return row;
}

function renderInvoiceTable() {
  const tbody = invoiceUIElements.invoiceTableBody();
  tbody.innerHTML = "";
  invoiceState.filteredInvoices.forEach(inv =>
    tbody.appendChild(renderInvoiceRow(inv))
  );
}

/* ================== MODAL ================== */

function viewInvoiceDetails(orderId) {
  const invoice = invoiceState.invoices.find(i => i.order_id === orderId);
  if (!invoice) return;

  invoiceState.currentInvoice = invoice;
  renderInvoiceModal(invoice);
  invoiceUIElements.invoiceModal().classList.remove("hidden");
}

function closeInvoiceModal() {
  invoiceUIElements.invoiceModal().classList.add("hidden");
}

function renderInvoiceModal(invoice) {
  const itemsHtml = (invoice.items || []).map(item => `
    <tr class="border-b">
      <td class="px-4 py-2">${item.product_name}</td>
      <td class="px-4 py-2 text-center">${item.quantity}</td>
      <td class="px-4 py-2 text-right">${formatCurrency(item.price)}</td>
      <td class="px-4 py-2 text-right">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>
  `).join("");

  invoiceUIElements.invoiceContent().innerHTML = `
    <div id="printArea" class="space-y-4">

      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Invoice INV-${invoice.order_id}</h2>
        <span class="text-sm text-gray-500">${formatDate(invoice.created_at)}</span>
      </div>

      <div class="text-sm">
        <p><b>Name:</b> ${invoice.customer.name}</p>
        <p><b>Email:</b> ${invoice.customer.email}</p>
        <p><b>Phone:</b> ${invoice.customer.phone}</p>
        <p><b>Address:</b> ${invoice.customer.address}</p>
      </div>

      <table class="w-full border text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left">Product</th>
            <th class="px-4 py-2 text-center">Qty</th>
            <th class="px-4 py-2 text-right">Price</th>
            <th class="px-4 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="flex justify-between items-center pt-4 border-t">
        <span class="font-semibold">
          Payment:
          <span class="${invoice.paid ? "text-green-600" : "text-red-600"}">
            ${invoice.paid ? "PAID" : "UNPAID"}
          </span>
        </span>

        <span class="text-lg font-bold">
          Total: ${formatCurrency(invoice.total_amount)}
        </span>
      </div>

     

    </div>
  `;
}

/* ================== PRINT ================== */

function printInvoice() {
  const content = document.getElementById("printArea").innerHTML;
  const win = window.open("", "", "width=900,height=700");

  win.document.write(`
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
}

/* ================== INIT ================== */

async function initializeInvoices() {
  showLoading();

  try {
    await dataCache.loadAll();

    invoiceState.invoices = dataCache.orders.map(o => ({
      order_id: o.id,
      customer_name: o.customer_name,
      customer: {
        name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        address: o.customer_address,
      },
      total_amount: o.total_amount,
      paid: o.order_paid,
      created_at: o.created_at,
      items: o.items || [],
    }));

    


    invoiceState.filteredInvoices = [...invoiceState.invoices];
    invoiceUIElements.customerFilter().addEventListener("change",applyFilters);
    populateCustomerFilter();

    invoiceUIElements.searchInput()
      .addEventListener("input", applyFilters);
    if (invoiceState.filteredInvoices.length === 0) {
      showEmpty();
    } else {
      renderInvoiceTable();
      showTable();
    }
  } catch (err) {
    console.error(err);
    showError("Failed to load invoices");
  }
}

document.addEventListener("DOMContentLoaded", initializeInvoices);
