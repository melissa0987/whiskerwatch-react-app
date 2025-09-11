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
    console.log('Attempting signup with data:', userData);
    
    // Try the users endpoint directly since auth/signup might not exist
    const response = await fetch(`${this.baseURL}/users`, {
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

    console.log('Signup response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('Signup error response:', errorData);
      return { 
        success: false, 
        message: errorData.message || `Signup failed with status ${response.status}` 
      };
    }

    const data = await response.json();
    console.log('Signup success response:', data);

    // After successful signup, try to login automatically
    console.log('Attempting automatic login after signup...');
    const loginResponse = await this.login(userData.email, userData.password);
    
    if (loginResponse.success) {
      console.log('Auto-login successful');
      return loginResponse;
    } else {
      console.log('Auto-login failed, but signup was successful');
      return { 
        success: true, 
        message: 'Account created successfully! Please login.',
        requiresManualLogin: true
      };
    }
    
  } catch (error) {
    console.error('Signup error:', error);
    return { 
      success: false, 
      message: 'Network error during signup. Please try again.' 
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
    console.log('Updating user profile:', { userId, profileData });
    return this.apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(userId, passwordData) {
    console.log('Changing password for user:', userId);
    return this.apiCall(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async deleteAccount(userId, deleteData) {
    console.log('Deleting account for user:', userId);
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

  // ==================== ADMIN API ENDPOINTS ====================

  // Get all users (admin only)
  async getAllUsers() {
    console.log('Fetching all users for admin');
    return this.apiCall('/users');
  }

  // Get all pets (admin only)
  async getAllPets() {
    console.log('Fetching all pets for admin');
    return this.apiCall('/pets');
  }

  // Get all bookings (admin only)
  async getAllBookings() {
    console.log('Fetching all bookings for admin');
    return this.apiCall('/bookings');
  }

  // Update user status (admin only)
  async updateUserStatus(userId, isActive) {
    console.log('Updating user status:', { userId, isActive });
    return this.apiCall(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  // Delete user as admin
  async deleteUserAsAdmin(userId) {
    console.log('Admin deleting user:', userId);
    return this.apiCall(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Delete pet as admin
  async deletePetAsAdmin(petId) {
    console.log('Admin deleting pet:', petId);
    return this.apiCall(`/pets/${petId}`, {
      method: 'DELETE',
    });
  }

  // Delete booking as admin
  async deleteBookingAsAdmin(bookingId) {
    console.log('Admin deleting booking:', bookingId);
    return this.apiCall(`/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  }

  // Update booking status as admin
  async updateBookingStatusAsAdmin(bookingId, statusId) {
    console.log('Admin updating booking status:', { bookingId, statusId });
    return this.apiCall(`/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ statusId }),
    });
  }

  // Get user statistics (admin only)
  async getUserStatistics() {
    console.log('Fetching user statistics for admin');
    return this.apiCall('/admin/stats/users');
  }

  // Get booking statistics (admin only)
  async getBookingStatistics() {
    console.log('Fetching booking statistics for admin');
    return this.apiCall('/admin/stats/bookings');
  }
}


export default new ApiService();