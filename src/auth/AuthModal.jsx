import React, { useState } from 'react';
import '../css/AuthModal.css'; // Custom CSS

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode, onAuthSuccess, apiService, defaultCustomerType }) => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    customerType: defaultCustomerType || '' 
  });

  React.useEffect(() => {
    if (isOpen && defaultCustomerType) {
      setFormData(prev => ({ ...prev, customerType: defaultCustomerType }));
    }
  }, [isOpen, defaultCustomerType]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    console.log('handleSubmit called with mode:', mode);
    console.log('formData:', formData);
    
    setIsSubmitting(true);
    setMessage('');

    try {
      if (mode === 'login') {
        console.log('Attempting login...');
        const response = await apiService.login(formData.email, formData.password);
        console.log('Login response:', response);
        
        if (response.success) {
          console.log('Login successful, calling onAuthSuccess with user:', response.user);
          setMessage('Login successful!');
          onAuthSuccess(response.user);
          setTimeout(() => {
            console.log('Closing modal...');
            onClose();
          }, 1000);
        } else {
          console.log('Login failed:', response.message);
          setMessage(response.message || 'Login failed');
        }
      } else {
        console.log('Attempting signup...');
        const signupData = {
          ...formData,
          customerTypeId:
            formData.customerType === 'OWNER' ? 1 :
            formData.customerType === 'SITTER' ? 2 : 3
        };
        console.log('Signup data:', signupData);
        
        const response = await apiService.signup(signupData);
        console.log('Signup response:', response);
        
        if (response.success) {
          console.log('Signup successful, calling onAuthSuccess with user:', response.user);
          setMessage('Signup successful!');
          onAuthSuccess(response.user);
          setTimeout(() => {
            console.log('Closing modal...');
            onClose();
          }, 1000);
        } else {
          console.log('Signup failed:', response.message);
          setMessage(response.message || 'Signup failed');
        }
      }
    } catch (err) {
      console.error('Error during auth:', err);
      setMessage('Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = () => {
    if (mode === 'login') return formData.email && formData.password;
    return formData.userName && formData.email && formData.password &&
           formData.firstName && formData.lastName && formData.phoneNumber && formData.address;
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="auth-modal-body">
          {mode === 'signup' && (
            <>
              <div className="input-row">
                <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} />
                <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} />
              </div>
              <input type="text" name="userName" placeholder="Username" value={formData.userName} onChange={handleInputChange} />
            </>
          )}

          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} />

          {mode === 'signup' && (
            <>
              <input type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleInputChange} />
              <textarea name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} rows="2" />
              <select name="customerType" value={formData.customerType} onChange={handleInputChange}>
                <option value="OWNER">Pet Owner</option>
                <option value="SITTER">Pet Sitter</option>
                <option value="BOTH">Both</option>
              </select>
            </>
          )}

          {message && <div className="auth-message">{message}</div>}

          <button className="submit-btn" disabled={!isFormValid() || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
          </button>
        </div>

        <div className="auth-modal-footer">
          <p>
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button onClick={onSwitchMode}>{mode === 'login' ? 'Sign Up' : 'Login'}</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;