const API_BASE = "http://127.0.0.1:8000";

const params = new URLSearchParams(window.location.search);
const orderId = params.get("order_id");

if (!orderId) {
  alert("Order ID missing");
}

async function loadOrderSummary() {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!res.ok) throw new Error("Failed to fetch order");

    const order = await res.json();

    // Header data
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

      const row = `
        <tr>
          <td class="px-4 py-2">${item.product_name}</td>
          <td class="px-4 py-2 text-right">₹ ${item.price}</td>
          <td class="px-4 py-2 text-center">${item.quantity}</td>
          <td class="px-4 py-2 text-right">₹ ${subtotal}</td>
        </tr>
      `;

      tbody.insertAdjacentHTML("beforeend", row);
    });

    document.getElementById("totalAmount").textContent = total;

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const orderId = new URLSearchParams(window.location.search).get("order_id");

  if (!orderId) {
    alert("Order ID missing");
    return;
  }

  const btn = document.getElementById("generateInvoiceBtn");
  btn.dataset.orderId = orderId;

  btn.addEventListener("click", () => generateInvoice(orderId));
});


async function generateInvoice(orderId) {
  try{
     const res = await apiClient.orders.generate_invoice(orderId);
 
 
     console.log(res);
     window.location.href = "invoice.html";
  }

  catch (e){
    console.log(e);
    alert("Failed to generate invoice");
  }


 
 
}

function payNow() {
  alert("Payment gateway integration coming soon");
}

loadOrderSummary();
