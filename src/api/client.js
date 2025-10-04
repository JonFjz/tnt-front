// Base API client for making HTTP requests
class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  // Base request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      // Handle non-JSON responses (like file uploads)
      const contentType = response.headers.get('content-type')
      let data
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        throw new ApiError(
          data.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        )
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Network or other errors
      throw new ApiError(
        `Network error: ${error.message}`,
        0,
        null
      )
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`)
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key])
      }
    })

    return this.request(endpoint + url.search, {
      method: 'GET',
    })
  }

  // POST request
  async post(endpoint, data = null) {
    const options = {
      method: 'POST',
    }

    if (data instanceof FormData) {
      // Don't set Content-Type for FormData, let browser set it with boundary
      options.body = data
      delete options.headers
    } else if (data) {
      options.body = JSON.stringify(data)
    }

    return this.request(endpoint, options)
  }

  // PUT request
  async put(endpoint, data = null) {
    const options = {
      method: 'PUT',
    }

    if (data instanceof FormData) {
      options.body = data
      delete options.headers
    } else if (data) {
      options.body = JSON.stringify(data)
    }

    return this.request(endpoint, options)
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    })
  }

  // PATCH request
  async patch(endpoint, data = null) {
    const options = {
      method: 'PATCH',
    }

    if (data instanceof FormData) {
      options.body = data
      delete options.headers
    } else if (data) {
      options.body = JSON.stringify(data)
    }

    return this.request(endpoint, options)
  }
}

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient()

export default apiClient
export { ApiError }