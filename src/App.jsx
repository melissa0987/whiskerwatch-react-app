import { useState } from "react";  
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from "./pages/homepage/Header"; 
import AuthModal from "./auth/AuthModal";
import Hero from "./pages/homepage/Hero";
import Features from "./pages/homepage/Features";
import HowItWorks from "./pages/homepage/HowItWorks";
import PetTypes from "./pages/homepage/PetTypes";
import Footer from "./pages/homepage/Footer";
import apiService from "./services/apiService";

// Main App Component
const App = () => { 
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [_currentUser, setCurrentUser] = useState(null);

  const openLogin = () => setAuthModal({ isOpen: true, mode: 'login' });
  const openSignup = () => setAuthModal({ isOpen: true, mode: 'signup' });
  const closeModal = () => setAuthModal({ isOpen: false, mode: 'login' });
  const switchMode = () => setAuthModal(prev => ({ 
    isOpen: true, 
    mode: prev.mode === 'login' ? 'signup' : 'login' 
  }));

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    console.log("Logged in user:", user);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogin={openLogin} onSignup={openSignup} />
      
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeModal}
        mode={authModal.mode}
        onSwitchMode={switchMode}
        onAuthSuccess={handleAuthSuccess}
        apiService={apiService}
      />

      <Hero/>
      <Features/>
      <HowItWorks/>
      <PetTypes/>
      <Footer/>
    </div>
  );
};

export default App;
