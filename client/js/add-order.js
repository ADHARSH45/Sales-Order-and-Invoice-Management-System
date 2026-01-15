

// --------------- STATE ---------------
const state = {
  items: []
};

// --------------- INIT ---------------
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("orderForm")
    .addEventListener("submit", submitOrder);

  // initially add one row
  addOrderItem();
});

// --------------- PRODUCT SEARCH ---------------
let searchTimeout = null;

// call backend search API
async function searchProducts(query) {
  if (!query || query.length < 2) return [];

  try {
    const products = await apiClient.products.search(query);
    return products || [];
  } catch (err) {
    console.error("Search API error", err);
    return [];
  }
}

function attachSearchHandler(input) {
  // container for autocomplete results
  const resultsBox = document.createElement("div");
  resultsBox.className = "absolute bg-white border rounded w-full z-10 max-h-40 overflow-auto text-sm shadow";
  input.parentElement.style.position = "relative";
  input.parentElement.appendChild(resultsBox);

  input.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const query = input.value.trim();

    searchTimeout = setTimeout(async () => {
      resultsBox.innerHTML = "";
      if (query.length < 2) {
        return;
      }

      const results = await searchProducts(query);

      if (results.length === 0) {
        resultsBox.innerHTML = `<div class="p-2 text-gray-500">No products found</div>`;
      } else {
        results.forEach(p => {
          const div = document.createElement("div");
          div.className = "p-2 hover:bg-gray-100 cursor-pointer";
          div.textContent = `${p.name} (₹${p.price})`;

          div.onclick = () => {
            // set selected product
            input.value = p.name;
            input.dataset.productId = p.id;
            input.dataset.price = p.price;
            // clear and hide suggestions
            resultsBox.innerHTML = "";
          };

          resultsBox.appendChild(div);
        });
      }
    }, 300);
  });

  // hide suggestions on outside click
  document.addEventListener("click", (e) => {
    if (!input.parentElement.contains(e.target)) {
      resultsBox.innerHTML = "";
    }
  });
}

// --------------- ORDER ITEMS ---------------
function addOrderItem() {
  const div = document.createElement("div");
  div.className = "grid grid-cols-[minmax(0,1fr)_90px_80px] gap-3 items-end";

  div.innerHTML = `
    <div class="relative">
      <input
        type="text"
        placeholder="Search product..."
        class="input product-search"
      >
    </div>

    <input
      type="number"
      min="1"
      value="1"
      class="input quantity text-center"
    />

    <button type="button"
      class="px-3 py-2 bg-red-100 text-red-700 rounded">
      Remove
    </button>
  `;

  // add new row to container
  document.getElementById("orderItemsContainer").appendChild(div);

  // attach autocomplete on product search
  const searchInput = div.querySelector(".product-search");
  attachSearchHandler(searchInput);

  // attach remove button
  const removeBtn = div.querySelector("button");
  removeBtn.onclick = () => div.remove();
}

// --------------- CALCULATE TOTALS ---------------
function calculateGrandTotal() {
  let total = 0;
  document.querySelectorAll("#orderItemsContainer > div").forEach(row => {
    const price = Number(row.querySelector(".product-search").dataset.price || 0);
    const qty = Number(row.querySelector(".quantity").value || 0);
    total += price * qty;
  });
  document.getElementById("grandTotal").textContent = total.toLocaleString("en-IN");
}

// optional: call calculateGrandTotal() after each qty / product select update
document.addEventListener("input", (e) => {
  if (e.target.matches(".quantity, .product-search")) calculateGrandTotal();
});

// --------------- SUBMIT ORDER ---------------
async function submitOrder(e) {
  e.preventDefault();

  const customer = {
    name: document.getElementById("customerName").value.trim(),
    email: document.getElementById("customerEmail").value.trim(),
    phone: document.getElementById("customerPhone").value.trim(),
    address: document.getElementById("customerAddress").value.trim(),
  };

  if (!customer.name || !customer.email || !customer.phone || !customer.address) {
    alert("Please fill all customer details");
    return;
  }

  const items = [];
  document.querySelectorAll("#orderItemsContainer > div").forEach(row => {
    const productId = Number(row.querySelector(".product-search").dataset.productId);
    const qty = Number(row.querySelector(".quantity").value);

    if (productId && qty > 0) {
      items.push({ product_id: productId, quantity: qty });
    }
  });

  if (!items.length) {
    alert("Please add at least one valid product");
    return;
  }
  console.log(customer,items);
  

  try {
    await apiClient.orders.create({ customer, items} );

    alert("Order created successfully!");
    window.location.href = "orders.html";
  } catch (err) {
    console.error("Order creation failed", err);
    alert("Failed to create order. Try again.");
  }
}
