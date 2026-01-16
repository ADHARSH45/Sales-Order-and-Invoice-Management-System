const API_BASE = "http://127.0.0.1:8000";

const params = new URLSearchParams(window.location.search);
const orderId = params.get("order_id");

let currentOrder = null; // ✅ store order globally

if (!orderId) {
  alert("Order ID missing");
}

/* ---------------- LOAD ORDER SUMMARY ---------------- */
async function loadOrderSummary() {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!res.ok) throw new Error("Failed to fetch order");

    const order = await res.json();
    currentOrder = order; // ✅ save order

    // Header
    document.getElementById("orderId").textContent = order.id;
    document.getElementById("customerName").textContent = order.customer_name;
    document.getElementById("customerEmail").textContent = order.customer_email;
    document.getElementById("customerPhone").textContent = order.customer_phone;
    document.getElementById("customerAddress").textContent = order.customer_address;
    document.getElementById("createdAt").textContent =
      new Date(order.created_at).toLocaleString();

    // Items
    const tbody = document.getElementById("itemsTable");
    tbody.innerHTML = "";

    let total = 0;

    order.items.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;

      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr>
          <td class="px-4 py-2">${item.product_name}</td>
          <td class="px-4 py-2 text-right">₹ ${item.price}</td>
          <td class="px-4 py-2 text-center">${item.quantity}</td>
          <td class="px-4 py-2 text-right">₹ ${subtotal}</td>
        </tr>
        `
      );
    });

    document.getElementById("totalAmount").textContent = total;

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

/* ---------------- GENERATE INVOICE ---------------- */
async function generateInvoice(orderId) {
  try {
    const res = await apiClient.orders.generate_invoice(orderId);
    console.log(res);
    window.location.href = `invoice.html?order_id=${orderId}`;
  } catch (e) {
    console.error(e);
    alert("Failed to generate invoice");
  }
}

/* ---------------- PAY NOW ---------------- */
function payNow() {
  if (!currentOrder) {
    alert("Order not loaded yet");
    return;
  }

  // ✅ correct URL
  window.location.href = `payment.html?order_id=${currentOrder.id}`;
}

/* ---------------- DOM LOAD ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("generateInvoiceBtn");

  if (btn) {
    btn.addEventListener("click", () => generateInvoice(orderId));
  }

  loadOrderSummary();
});
