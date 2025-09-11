class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:8080/api';
    this.token = this.getStoredToken();
  }

  // Token management
  getStoredToken() {
    return localStorage.getItem('jwt_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('jwt_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('jwt_token');
  }

  // Get headers with Authorization
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic API call method with improved error handling
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        this.removeToken();
        window.location.href = '/'; // Redirect to login
        throw new Error('Authentication failed. Please login again.');
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      const hasJsonContent = contentType && contentType.includes('application/json');
      
      let data = {};
      
      // Only try to parse JSON if there's content and it's JSON
      if (hasJsonContent) {
        const text = await response.text();
        if (text.trim()) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            data = { message: 'Invalid response format' };
          }
        }
      }
      
      if (!response.ok) {
        const errorMessage = data.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return { success: true, data, status: response.status };
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      return { 
        success: false, 
        message: error.message || 'An error occurred',
        status: error.status 
      };
    }
  }

  getCustomerTypeIdFromName(customerTypeName) {
    switch (customerTypeName?.toUpperCase()) {
      case 'OWNER':
      case 'PET OWNER':
        return 1;
      case 'SITTER':
      case 'PET SITTER':
        return 2; 
      default:
        return 1; // Default to owner
    }
  }

  // Authentication methods
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok && data.accessToken) {
        this.setToken(data.accessToken);
        
        const user = data.user;
        return { 
          success: true, 
          user: {
            id: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            customerTypeId: this.getCustomerTypeIdFromName(user.customerTypeName),
            roleName: user.roleName
          },
          token: data.accessToken 
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    }
  }

  async signup(userData) {
    try {
      let response;
      try {
        response = await fetch(`${this.baseURL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            address: userData.address,
            customerTypeId: userData.customerTypeId,
            roleId: 1, // CUSTOMER role
            isActive: true
          }),
        });
      } catch (authError) {
        console.log('Auth signup not available, using users endpoint', authError);
        response = await fetch(`${this.baseURL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            address: userData.address,
            customerTypeId: userData.customerTypeId,
            roleId: 1, // CUSTOMER role
            isActive: true
          }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          this.setToken(data.token);
          const user = data.userResponse || data.user;
          return { 
            success: true, 
            user: {
              id: user.userId || user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              email: user.email,
              phoneNumber: user.phoneNumber,
              address: user.address,
              customerTypeId: this.getCustomerTypeIdFromName(user.customerTypeName || user.customerType),
              roleName: user.roleName || user.role
            },
            token: data.token 
          };
        } else {
          const loginResponse = await this.login(userData.email, userData.password);
          if (loginResponse.success) {
            return loginResponse;
          } else {
            return { 
              success: true, 
              user: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                address: userData.address,
                customerTypeId: userData.customerTypeId
              },
              message: 'Account created successfully!' 
            };
          }
        }
      } else {
        return { 
          success: false, 
          message: data.message || 'Signup failed' 
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    }
  }

  logout() {
    this.removeToken();
  }

  isAuthenticated() {
    return !!this.token;
  }

  async verifyToken() {
    if (!this.token) return false;
    
    try {
      const response = await fetch(`${this.baseURL}/auth/verify`, {
        headers: this.getAuthHeaders(),
      });
      
      if (response.status === 401) {
        this.removeToken();
        return false;
      }
      
      return response.ok;
    } catch (error) {
      console.error('Token verification failed:', error);
      this.removeToken();
      return false;
    }
  }

  // Protected API endpoints
  async getPetsByOwner(ownerId) {
    return this.apiCall(`/pets/owner/${ownerId}`);
  }

  async getBookingsByOwner(ownerId) {
    return this.apiCall(`/bookings/owner/${ownerId}`);
  }

  async getBookingsBySitter(sitterId) {
    return this.apiCall(`/bookings/sitter/${sitterId}`);
  }

  async updateUserProfile(userId, profileData) {
    return this.apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(userId, passwordData) {
    return this.apiCall(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async deleteAccount(userId, deleteData) {
    return this.apiCall(`/users/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify(deleteData),
    });
  }

  // Pet management methods
  async createPet(petData) {
    console.log('Creating pet with token:', this.token ? 'Present' : 'Missing');
    const response = await this.apiCall('/pets', { method: 'POST', body: JSON.stringify(petData) });
     return response;
  }

  async updatePet(petId, petData) {
    console.log('Updating pet with token:', this.token ? 'Present' : 'Missing');
    return this.apiCall(`/pets/${petId}`, {
      method: 'PUT',
      body: JSON.stringify(petData),
    });
  }

  async deletePet(petId) {
    console.log('Deleting pet with token:', this.token ? 'Present' : 'Missing');
    console.log('Authorization header:', this.getAuthHeaders().Authorization);
    return this.apiCall(`/pets/${petId}`, {
      method: 'DELETE',
    });
  }

  // Booking management methods
  async createBooking(bookingData) {
    return this.apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(bookingId, bookingData) {
    return this.apiCall(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async deleteBooking(bookingId) {
    return this.apiCall(`/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  }

  async cancelBooking(bookingId) {
    return this.apiCall(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  }
  
  async updateBookingStatus(bookingId, statusId) {
    return this.apiCall(`/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ statusId }),
    });
  }

  async getUpcomingBookings() {
    return this.apiCall('/bookings/upcoming');
  }
}

export default new ApiService();