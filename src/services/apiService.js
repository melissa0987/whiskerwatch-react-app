import axios from "axios";

const API_URL = "http://localhost:8080/api"; // adjust if deployed

const apiService = {
  // User Authentication
  signup: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users`, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        roleId: 1, // CUSTOMER role
        customerTypeId: userData.customerTypeId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        isActive: true
      });
      
      console.log('Signup API response:', response.data);
      
      // Check if signup was successful (201 status code)
      if (response.status === 201) {
        // After successful signup, fetch the created user by email
        try {
          const userResponse = await axios.get(`${API_URL}/users`);
          if (userResponse.data && Array.isArray(userResponse.data)) {
            const createdUser = userResponse.data.find(u => u.email === userData.email);
            if (createdUser) {
              return {
                success: true,
                user: {
                  id: createdUser.userId,
                  firstName: createdUser.firstName,
                  lastName: createdUser.lastName,
                  username: createdUser.username,
                  email: createdUser.email,
                  phoneNumber: createdUser.phoneNumber,
                  address: createdUser.address,
                  customerTypeId: getCustomerTypeIdFromName(createdUser.customerTypeName),
                  roleName: createdUser.roleName
                },
                message: 'Account created successfully!'
              };
            }
          }
        } catch (fetchError) {
          console.error('Error fetching created user:', fetchError);
        }
        
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
      } else {
        return {
          success: false,
          message: 'Signup failed'
        };
      }
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.response?.statusText || 'Server error during signup'
      };
    }
  },

  login: async (email, password) => {
    try {
      console.log('Attempting login for email:', email);
      
      // Use the new auth endpoint
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email,
        password: password
      });
      
      console.log('Login API response:', response.data);
      
      if (response.data.success && response.data.user) {
        const user = response.data.user;
        
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
            customerTypeId: getCustomerTypeIdFromName(user.customerTypeName),
            roleName: user.roleName
          },
          message: 'Login successful!'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          message: error.response.data.message || 'Invalid email or password'
        };
      }
      
      return {
        success: false,
        message: 'Server error during login'
      };
    }
  },

  // User Management
  getUser: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Get user failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.statusText || 'Failed to get user'
      };
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(`${API_URL}/users/${userId}`, userData);
      return {
        success: response.status === 200,
        data: response.data
      };
    } catch (error) {
      console.error("Update user failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.statusText || 'Failed to update user'
      };
    }
  },

  // Pet Management
  getPetsByOwner: async (ownerId) => {
    try {
      const response = await axios.get(`${API_URL}/pets/owner/${ownerId}`);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error("Get pets failed:", error.response?.data || error.message);
      return {
        success: false,
        data: [],
        message: error.response?.statusText || 'Failed to get pets'
      };
    }
  },

  createPet: async (petData) => {
    try {
      const response = await axios.post(`${API_URL}/pets`, petData);
      return {
        success: response.status === 201,
        data: response.data
      };
    } catch (error) {
      console.error("Create pet failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.statusText || 'Failed to create pet'
      };
    }
  },

  updatePet: async (petId, petData) => {
    try {
      const response = await axios.put(`${API_URL}/pets/${petId}`, petData);
      return {
        success: response.status === 200,
        data: response.data
      };
    } catch (error) {
      console.error("Update pet failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.statusText || 'Failed to update pet'
      };
    }
  },

  deletePet: async (petId) => {
    try {
      const response = await axios.delete(`${API_URL}/pets/${petId}`);
      return {
        success: response.status === 204,
        message: 'Pet deleted successfully'
      };
    } catch (error) {
      console.error("Delete pet failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.statusText || 'Failed to delete pet'
      };
    }
  },

  // Booking Management
  getBookingsByOwner: async (ownerId) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/owner/${ownerId}`);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error("Get bookings failed:", error.response?.data || error.message);
      return {
        success: false,
        data: [],
        message: error.response?.statusText || 'Failed to get bookings'
      };
    }
  },

  getBookingsBySitter: async (sitterId) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/sitter/${sitterId}`);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error("Get sitter bookings failed:", error.response?.data || error.message);
      return {
        success: false,
        data: [],
        message: error.response?.statusText || 'Failed to get sitter bookings'
      };
    }
  },

  createBooking: async (bookingData) => {
    try {
      const response = await axios.post(`${API_URL}/bookings`, bookingData);
      return {
        success: response.status === 201,
        data: response.data
      };
    } catch (error) {
      console.error("Create booking failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.statusText || 'Failed to create booking'
      };
    }
  },

  updateBooking: async (bookingId, bookingData) => {
    try {
      const response = await axios.put(`${API_URL}/bookings/${bookingId}`, bookingData);
      return {
        success: response.status === 200,
        data: response.data
      };
    } catch (error) {
      console.error("Update booking failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.statusText || 'Failed to update booking'
      };
    }
  },

  updateBookingStatus: async (bookingId, statusId) => {
    try {
      const response = await axios.patch(`${API_URL}/bookings/${bookingId}/status`, {
        statusId: statusId
      });
      return {
        success: response.status === 200,
        data: response.data
      };
    } catch (error) {
      console.error("Update booking status failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.statusText || 'Failed to update booking status'
      };
    }
  },

  deleteBooking: async (bookingId) => {
    try {
      const response = await axios.delete(`${API_URL}/bookings/${bookingId}`);
      return {
        success: response.status === 204,
        message: 'Booking deleted successfully'
      };
    } catch (error) {
      console.error("Delete booking failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.statusText || 'Failed to delete booking'
      };
    }
  },

  // Additional utility methods
  getUpcomingBookings: async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings/upcoming`);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error("Get upcoming bookings failed:", error.response?.data || error.message);
      return {
        success: false,
        data: [],
        message: error.response?.statusText || 'Failed to get upcoming bookings'
      };
    }
  },

  checkSitterAvailability: async (sitterId, date, startTime, endTime) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/availability/${sitterId}`, {
        params: { date, startTime, endTime }
      });
      return {
        success: true,
        available: response.data
      };
    } catch (error) {
      console.error("Check availability failed:", error.response?.data || error.message);
      return {
        success: false,
        available: false,
        message: error.response?.statusText || 'Failed to check availability'
      };
    }
  }
};

// Helper function to convert customer type name to ID
function getCustomerTypeIdFromName(customerTypeName) {
  switch (customerTypeName) {
    case 'OWNER': return 1;
    case 'SITTER': return 2;
    case 'BOTH': return 3;
    default: return 1;
  }
}

export default apiService;