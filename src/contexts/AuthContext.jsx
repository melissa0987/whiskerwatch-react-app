import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/apiService';
// Auth state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiService.getStoredToken();
      console.log('Initializing auth - Token found:', token ? 'Yes' : 'No');
      
      if (token) {
        console.log('Token exists, verifying...');
        const isValid = await apiService.verifyToken();
        console.log('Token valid:', isValid);
        
        if (isValid) {
          // Token is valid but we need user data
          // For now, just set loading to false and let login handle user data
          dispatch({
            type: AUTH_ACTIONS.SET_LOADING,
            payload: { isLoading: false },
          });
        } else {
          console.log('Token invalid, removing and logging out');
          apiService.removeToken();
          dispatch({
            type: AUTH_ACTIONS.LOGOUT,
          });
        }
      } else {
        console.log('No token found, setting loading to false');
        dispatch({
          type: AUTH_ACTIONS.SET_LOADING,
          payload: { isLoading: false },
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await apiService.login(email, password);
      console.log('Login response in AuthContext:', response);
      
      if (response.success) {
        console.log('Login successful, setting user:', response.user);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: response.user },
        });
        return { success: true, user: response.user };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: response.message },
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during login';
      console.error('Login error in AuthContext:', errorMessage);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, message: errorMessage };
    }
  };

  // Signup function
  const signup = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await apiService.signup(userData);
      console.log('Signup response in AuthContext:', response);
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: response.user },
        });
        return { success: true, user: response.user };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: response.message },
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during signup';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    console.log('Logging out user');
    apiService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update user data
  const updateUser = (userData) => {
    console.log('Updating user data:', userData);
    dispatch({
      type: AUTH_ACTIONS.SET_USER,
      payload: { user: userData },
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    login,
    signup,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context - moved outside component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};