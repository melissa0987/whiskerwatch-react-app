import React, { useState } from 'react';
import Header from "../components/homepage/Header"; 
import AuthModal from "../auth/AuthModal";
import Hero from "../components/homepage/Hero";
import Features from "../components/homepage/Features";
import HowItWorks from "../components/homepage/HowItWorks";
import PetTypes from "../components/homepage/PetTypes";
import Footer from "../components/homepage/Footer";
import apiService from "../services/apiService";

const Homepage = ({ onAuthSuccess, currentUser, onLogout }) => { 
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login', customerType: '' });

  const openLogin = () => setAuthModal({ isOpen: true, mode: 'login', customerType: '' });
  const openSignup = (customerType = '') => setAuthModal({ isOpen: true, mode: 'signup', customerType });
  const closeModal = () => setAuthModal({ isOpen: false, mode: 'login', customerType: '' });
  const switchMode = () => setAuthModal(prev => ({ 
    isOpen: true, 
    mode: prev.mode === 'login' ? 'signup' : 'login',
    customerType: prev.customerType
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onLogin={openLogin} 
        onSignup={() => openSignup()} 
        onLogout={onLogout}
        currentUser={currentUser}
      />
      
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeModal}
        mode={authModal.mode}
        onSwitchMode={switchMode}
        onAuthSuccess={onAuthSuccess}  
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
      <Footer currentUser={currentUser} />
    </div>
  );
};

export default Homepage;