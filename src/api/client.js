// Base API client for making HTTP requests
class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;
  }

  // Build full URL with optional query params
  _buildURL(endpoint, params) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.append(k, v);
      });
    }
    return url.toString();
  }

  // Base request method
  async request(fullUrl, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const isFormData = options.body instanceof FormData;

    // Minimal, smart headers:
    // - Always allow Accept (simple header, no preflight)
    // - Only set Content-Type for non-GET and non-FormData
    const baseHeaders = { Accept: 'application/json' };
    if (method !== 'GET' && !isFormData && !(options.headers && options.headers['Content-Type'])) {
      baseHeaders['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers: { ...baseHeaders, ...(options.headers || {}) },
    };

    try {
      const response = await fetch(fullUrl, config);
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        throw new ApiError(
          (data && (data.message || data.error)) || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(`Network error: ${err.message}`, 0, null);
    }
  }

  // GET request (no Content-Type header)
  async get(endpoint, params = {}) {
    const url = this._buildURL(endpoint, params);
    return this.request(url, { method: 'GET' });
  }

  // POST request with optional query params
  async post(endpoint, data = null, params = null) {
    const url = this._buildURL(endpoint, params);
    const options = { method: 'POST' };

    if (data instanceof FormData) {
      options.body = data; // don't set Content-Type
    } else if (data) {
      options.body = JSON.stringify(data); // Content-Type will be set automatically
    }

    return this.request(url, options);
  }

  async put(endpoint, data = null, params = null) {
    const url = this._buildURL(endpoint, params);
    const options = { method: 'PUT' };
    options.body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined);
    return this.request(url, options);
  }

  async patch(endpoint, data = null, params = null) {
    const url = this._buildURL(endpoint, params);
    const options = { method: 'PATCH' };
    options.body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined);
    return this.request(url, options);
  }

  async delete(endpoint, params = null) {
    const url = this._buildURL(endpoint, params);
    return this.request(url, { method: 'DELETE' });
  }
}

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient;
export { ApiError };
