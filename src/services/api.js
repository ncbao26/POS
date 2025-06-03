// API Configuration với support cho environment variables
const getApiBaseUrl = () => {
  // Ưu tiên VITE_API_URL từ environment
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  
  // Fallback cho VITE_API_BASE_URL
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Production với full URL (không dùng relative path để tránh CORS)
  if (import.meta.env.PROD) {
    return 'https://mixxstorepos-backend.onrender.com/api';
  }
  
  // Development fallback
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('=== API Configuration ===');
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Final API Base URL:', API_BASE_URL);
console.log('========================');

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Getting auth headers - Token exists:', !!token);
  if (token) {
    console.log('Token preview:', token.substring(0, 50) + '...');
    console.log('Token length:', token.length);
  }
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  console.log('API Call:', response.url, 'Status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    let errorData = null;
    
    try {
      const responseText = await response.text();
      console.log('Error response text:', responseText);
      
      if (responseText) {
        try {
          errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
      }
    } catch (e) {
      console.log('Could not read error response:', e);
      errorMessage = response.statusText || errorMessage;
    }
    
    if (response.status === 401) {
      console.log('401 Unauthorized detected for:', response.url);
      console.log('Current token:', localStorage.getItem('token')?.substring(0, 50) + '...');
      
      // Chỉ logout nếu không phải là login endpoint
      if (!response.url.includes('/auth/login') && !response.url.includes('/auth/register')) {
        console.log('Auto-logout will trigger in 5 seconds for debugging...');
        // Delay auto-logout để có thời gian debug
        setTimeout(() => {
          if (!window.location.pathname.includes('/login')) {
            console.log('Auto-logout triggered due to 401');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }, 5000); // Tăng thời gian delay lên 5 giây
      }
    }
    
    console.error('API Error:', errorMessage, errorData);
    throw new Error(errorMessage);
  }
  
  const responseText = await response.text();
  console.log('Success response text:', responseText);
  
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.log('Response is not JSON, returning as text');
    return responseText;
  }
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Products API
export const productsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  search: async (name) => {
    const response = await fetch(`${API_BASE_URL}/products/search?name=${encodeURIComponent(name)}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getLowStock: async (threshold = 10) => {
    const response = await fetch(`${API_BASE_URL}/products/low-stock?threshold=${threshold}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (product) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product)
    });
    return handleResponse(response);
  },

  update: async (id, product) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(product)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Customers API
export const customersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  search: async (search) => {
    const response = await fetch(`${API_BASE_URL}/customers/search?search=${encodeURIComponent(search)}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (customer) => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(customer)
    });
    return handleResponse(response);
  },

  update: async (id, customer) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(customer)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Invoices API
export const invoicesAPI = {
  getAll: async () => {
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE_URL}/invoices?_t=${timestamp}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE_URL}/invoices/${id}?_t=${timestamp}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getByDateRange: async (startDate, endDate, status) => {
    let url = `${API_BASE_URL}/invoices/filter?`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);
    
    // Add timestamp to avoid caching
    params.append('_t', new Date().getTime().toString());
    
    const response = await fetch(url + params.toString(), {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (invoice) => {
    console.log('Creating invoice with data:', invoice);
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(invoice)
    });
    console.log('Invoice create response status:', response.status);
    return handleResponse(response);
  },

  update: async (id, invoice) => {
    console.log('Updating invoice with data:', invoice);
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(invoice)
    });
    console.log('Invoice update response status:', response.status);
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Revenue chart endpoints
  getRevenueByDate: async (startDate, endDate) => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    params.append('_t', new Date().getTime().toString()); // Avoid caching
    
    const response = await fetch(`${API_BASE_URL}/invoices/revenue-by-date?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getRevenueSummary: async (date = null) => {
    const params = new URLSearchParams();
    if (date) {
      params.append('date', date);
    }
    params.append('_t', new Date().getTime().toString()); // Avoid caching
    
    const response = await fetch(`${API_BASE_URL}/invoices/revenue-summary?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
}; 