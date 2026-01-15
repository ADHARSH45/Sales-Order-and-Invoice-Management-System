const API = "http://127.0.0.1:8000";

async function loadDashboard() {
  try {
    const [products, orders, invoices] = await Promise.all([
      fetch(`${API}/products`).then(r => r.json()),
      fetch(`${API}/orders`).then(r => r.json()),
      fetch(`${API}/invoices`).then(r => r.json()).catch(() => [])
    ]);

    // Counts
    document.getElementById("productCount").textContent = products.length;
    document.getElementById("orderCount").textContent = orders.length;

    const paidInvoices = invoices.filter(i => i.payment_status === "PAID");
    document.getElementById("paidInvoices").textContent = paidInvoices.length;

    // Revenue calculation
    let revenue = 0;

    paidInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        revenue += item.price * item.quantity;
      });
    });

    document.getElementById("totalRevenue").textContent =
      `₹${revenue.toLocaleString("en-IN")}`;

    // Low stock
    const lowStock = products.filter(p => p.stock <= 5);
    const list = document.getElementById("lowStockList");
    list.innerHTML = "";

    if (lowStock.length === 0) {
      list.innerHTML = `<li class="text-green-600">All stocks are healthy</li>`;
    } else {
      lowStock.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.name} — ${p.stock} left`;
        list.appendChild(li);
      });
    }

  } catch (err) {
    console.error("Dashboard error", err);
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
