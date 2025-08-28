import { useState } from "react";  
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from "../components/homepage/Header"; 
import AuthModal from "../auth/AuthModal";
import Hero from "../components/homepage/Hero";
import Features from "../components/homepage/Features";
import HowItWorks from "../components/homepage/HowItWorks";
import PetTypes from "../components/homepage/PetTypes";
import Footer from "../components/homepage/Footer";
import apiService from "../services/apiService";

// Main App Component
// Main App Component
const Homepage = () => { 
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login', customerType: '' });
  const [_currentUser, setCurrentUser] = useState(null);

  const openLogin = () => setAuthModal({ isOpen: true, mode: 'login', customerType: '' });
  const openSignup = (customerType = '') => setAuthModal({ isOpen: true, mode: 'signup', customerType });
  const closeModal = () => setAuthModal({ isOpen: false, mode: 'login', customerType: '' });
  const switchMode = () => setAuthModal(prev => ({ 
    isOpen: true, 
    mode: prev.mode === 'login' ? 'signup' : 'login',
    customerType: prev.customerType // keep type when switching
  }));

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    console.log("Logged in user:", user);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogin={openLogin} onSignup={() => openSignup()} />
      
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeModal}
        mode={authModal.mode}
        onSwitchMode={switchMode}
        onAuthSuccess={handleAuthSuccess}
        apiService={apiService}
        defaultCustomerType={authModal.customerType}  
      />

      <Hero 
        onFindSitter={() => openSignup("OWNER")} 
        onBecomeSitter={() => openSignup("SITTER")} 
      />
      <Features/>
      <HowItWorks/>
      <PetTypes/>
      <Footer/>
    </div>
  );
};
export default Homepage;