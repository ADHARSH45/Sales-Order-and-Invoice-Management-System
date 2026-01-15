const API_BASE_URL = 'http://localhost:8000';

const apiClient = {
  async request(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  customers: {
    getAll() {
      return apiClient.request('/customers');
    },

    getById(id) {
      return apiClient.request(`/customers/${id}`);
    },

    create(data) {
      return apiClient.request('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update(id, data) {
      return apiClient.request(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete(id) {
      return apiClient.request(`/customers/${id}`, {
        method: 'DELETE',
      });
    },
  },

  products: {
    getAll() {
      return apiClient.request('/products');
    },

    getById(id) {
      return apiClient.request(`/products/${id}`);
    },

    create(data) {
      return apiClient.request('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update(id, data) {
      return apiClient.request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete(id) {
      return apiClient.request(`/products/${id}`, {
        method: 'DELETE',
      });
    },
    search(query) {
      return apiClient.request(`/products/search?q=${encodeURIComponent(query)}`);
  },
    
  },

  orders: {
    getAll() {
      return apiClient.request('/orders');
    },

    getById(id) {
      return apiClient.request(`/orders/${id}`);
    },

    create(data) {
      return apiClient.request('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update(id, data) {
      return apiClient.request(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete(id) {
      return apiClient.request(`/orders/${id}`, {
        method: 'DELETE',
      });
    },
    generate_invoice(id){
      return apiClient.request(`/orders/${id}/generate_invoice`,
        {method :'POST',}
      );
    }
  },
};

const dataCache = {
  customers: null,
  products: null,
  orders: null,
  lastFetch: null,

  async loadAll() {
    try {
      const [customers, products, orders] = await Promise.all([
        apiClient.customers.getAll(),
        apiClient.products.getAll(),
        apiClient.orders.getAll(),
      ]);

      this.customers = customers;
      this.products = products;
      this.orders = orders;
      this.lastFetch = Date.now();

      return { customers, products, orders };
    } catch (error) {
      console.error('Failed to load data cache:', error);
      throw error;
    }
  },

  createCustomerMap() {
    const map = {};
    if (this.customers && Array.isArray(this.customers)) {
      this.customers.forEach((customer) => {
        map[customer.id] = customer;
      });
    }
    return map;
  },

  createProductMap() {
    const map = {};
    if (this.products && Array.isArray(this.products)) {
      this.products.forEach((product) => {
        map[product.id] = product;
      });
    }
    return map;
  },

  getCustomerName(customerId) {
    const customerMap = this.createCustomerMap();
    return customerMap[customerId]?.name || 'Unknown Customer';
  },

  getProductPrice(productId) {
    const productMap = this.createProductMap();
    return productMap[productId]?.price || 0;
  },

  calculateOrderTotal(order) {
    if (!order.items || !Array.isArray(order.items)) {
      return 0;
    }

    return order.items.reduce((total, item) => {
      const price = this.getProductPrice(item.product_id);
      return total + (price * item.quantity);
    }, 0);
  },

  generateInvoiceId(orderId) {
    return `INV-${orderId}`;
  },

  generateInvoices() {
    if (!this.orders || !Array.isArray(this.orders)) {
      return [];
    }

    return this.orders.map((order) => ({
      invoice_id: this.generateInvoiceId(order.id),
      order_id: order.id,
      customer_id: order.customer_id,
      customer_name: this.getCustomerName(order.customer_id),
      total_amount: this.calculateOrderTotal(order),
      created_at: order.created_at,
      items: order.items || [],
    }));
  },
};
