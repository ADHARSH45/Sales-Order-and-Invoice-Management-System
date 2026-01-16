const API_BASE = "http://127.0.0.1:8000";

const params = new URLSearchParams(window.location.search);
const orderId = params.get("order_id");

document.getElementById("orderIdText").textContent = orderId;

/* ---------------- PAYMENT METHOD SWITCH ---------------- */

document.querySelectorAll("input[name='method']").forEach(radio => {
  radio.addEventListener("change", () => {
    document.getElementById("cardForm").classList.add("hidden");
    document.getElementById("upiForm").classList.add("hidden");

    if (radio.value === "card") {
      document.getElementById("cardForm").classList.remove("hidden");
    }

    if (radio.value === "upi") {
      document.getElementById("upiForm").classList.remove("hidden");
    }
  });
});

/* ---------------- PAY NOW ---------------- */

async function payNow() {
  if (!orderId) {
    alert("Order ID missing");
    return;
  }

  const status = document.getElementById("statusMsg");
  status.textContent = "Processing payment...";
  status.className = "text-blue-600 text-center";

  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/paid`, {
      method: "POST",
      headers : {
        "Content-Type" : "application/json"
      }
    });

    if (!res.ok) throw new Error("Payment failed");

    status.textContent = "Payment successful!";
    status.className = "text-green-600 text-center";

    setTimeout(() => {
      window.location.href = `invoice.html`;
    }, 1200);

  } catch (err) {
    status.textContent = "Payment failed. Try again.";
    status.className = "text-red-600 text-center";
  }
}
