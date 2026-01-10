
let products = [];        // product list
let orders = [];          // orders
let currentOrder = null;  // active order
let editProductIndex = null;


function addOrUpdateProduct() {
  const product = {
    name: pname.value.trim(),
    price: pprice.value,
    stock: pqty.value
  };

  if (!product.name) {
    alert("Product name required");
    return;
  }

  if (editProductIndex === null) {
    products.push(product);
  } else {
    products[editProductIndex] = product;
    editProductIndex = null;
  }

  pname.value = pprice.value = pqty.value = "";
  renderProducts();
}

function renderProducts() {
  if (!window.productTable) return;

  productTable.innerHTML = "";
  products.forEach((p, i) => {
    productTable.innerHTML += `
      <tr>
        <td class="border p-2">${p.name}</td>
        <td class="border p-2">${p.price}</td>
        <td class="border p-2">${p.stock}</td>
        <td class="border p-2 space-x-2">
          <button onclick="editProduct(${i})"
            class="bg-yellow-400 px-2 py-1 rounded">Edit</button>
          <button onclick="deleteProduct(${i})"
            class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
        </td>
      </tr>
    `;
  });
}

function editProduct(index) {
  const p = products[index];
  pname.value = p.name;
  pprice.value = p.price;
  pqty.value = p.stock;
  editProductIndex = index;
}

function deleteProduct(index) {
  products.splice(index, 1);
  renderProducts();
}

let orderItems = [];

function addOrderItem() {
  const row = document.createElement("div");
  row.className = "relative flex gap-2";

  row.innerHTML = `
    <div class="w-full relative">
      <input type="text"
        class="border p-2 w-full"
        placeholder="Type product name"
        oninput="showSuggestions(this)">
      <div class="absolute bg-white border w-full hidden z-20"></div>
    </div>

    <input type="number"
      class="border p-2 w-24"
      placeholder="Qty">

    <button onclick="removeOrderItem(this)"
      class="bg-red-500 text-white px-3 rounded">X</button>
  `;

  orderItems.push(row);
  items.appendChild(row);
}

function removeOrderItem(btn) {
  const row = btn.parentElement;
  row.remove();
  orderItems = orderItems.filter(r => r !== row);
}

function showSuggestions(input) {
  const box = input.nextElementSibling;
  const value = input.value.toLowerCase();

  box.innerHTML = "";

  if (!value) {
    box.classList.add("hidden");
    return;
  }

  const matches = products
    .map(p => p.name)
    .sort((a, b) => a.localeCompare(b))
    .filter(name => name.toLowerCase().startsWith(value));

  if (matches.length === 0) {
    box.classList.add("hidden");
    return;
  }

  matches.forEach(name => {
    const item = document.createElement("div");
    item.className = "p-2 hover:bg-blue-100 cursor-pointer";
    item.innerText = name;

    item.onclick = () => {
      input.value = name;
      box.classList.add("hidden");
    };

    box.appendChild(item);
  });

  box.classList.remove("hidden");
}

function saveOrder() {
  currentOrder = {
    customer: {
      name: cname.value,
      address: address.value,
      phone: phone.value,
      email: email.value
    },
    items: orderItems.map(row => ({
      product: row.querySelector("input[type=text]").value,
      quantity: row.querySelector("input[type=number]").value
    }))
  };

  if (!currentOrder.customer.name) {
    alert("Customer name required");
    return;
  }

  orders.push(currentOrder);
  window.location.href = "order-summary.html";
}

/************************************************************
 * ORDER SUMMARY (DISPLAY ONLY)
 ************************************************************/
function loadSummary() {
  if (!window.summary || !currentOrder) return;

  summary.innerHTML = `
    <p class="font-bold text-lg">${currentOrder.customer.name}</p>

    <table class="w-full border mt-4">
      <tr class="bg-gray-200">
        <th class="border p-2">Product</th>
        <th class="border p-2">Quantity</th>
        <th class="border p-2">Price</th>
      </tr>

      ${currentOrder.items.map(i => {
        const p = products.find(x => x.name === i.product);
        return `
          <tr>
            <td class="border p-2">${i.product}</td>
            <td class="border p-2">${i.quantity}</td>
            <td class="border p-2">${p ? p.price : "-"}</td>
          </tr>
        `;
      }).join("")}
    </table>
  `;
}

function generateInvoice() {
  window.location.href = "invoice.html";
}

/************************************************************
 * INVOICE (DISPLAY ONLY)
 ************************************************************/
function loadInvoice() {
  if (!window.invoice || !currentOrder) return;

  invoice.innerHTML = `
    <p class="font-bold text-lg">${currentOrder.customer.name}</p>

    <table class="w-full border mt-4">
      <tr class="bg-gray-200">
        <th class="border p-2">Product</th>
        <th class="border p-2">Quantity</th>
        <th class="border p-2">Price</th>
      </tr>

      ${currentOrder.items.map(i => {
        const p = products.find(x => x.name === i.product);
        return `
          <tr>
            <td class="border p-2">${i.product}</td>
            <td class="border p-2">${i.quantity}</td>
            <td class="border p-2">${p ? p.price : "-"}</td>
          </tr>
        `;
      }).join("")}
    </table>
  `;
}

function goToPayment() {
  window.location.href = "payment.html";
}

/************************************************************
 * PAYMENT (STATUS ONLY)
 ************************************************************/
function confirmPayment() {
  paymentResult.innerHTML = `
    <span class="text-green-600 font-bold">
      Payment ${status.value}
    </span>
    via ${method.value}
  `;
}

/************************************************************
 * PAGE INITIALIZER
 ************************************************************/
window.onload = () => {
  renderProducts();
  loadSummary();
  loadInvoice();
};
