import { useState } from "react"; 
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';


import Header from "./components/layout/Header";
import Hero from "./components/home/Hero";
import Features from "./components/home/Features";
import HowItWorks from "./components/home/HowItWorks";
import PetTypes from "./components/home/PetTypes";
import Footer from "./components/layout/Footer";
import AuthModal from "./components/auth/AuthModal";

// Main App Component
const App = () => {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  const openLogin = () => setAuthModal({ isOpen: true, mode: 'login' });
  const openSignup = () => setAuthModal({ isOpen: true, mode: 'signup' });
  const closeModal = () => setAuthModal({ isOpen: false, mode: 'login' });
  const switchMode = () => setAuthModal(prev => ({ 
    isOpen: true, 
    mode: prev.mode === 'login' ? 'signup' : 'login' 
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogin={openLogin} onSignup={openSignup} />
      <Hero />
      <Features />
      <HowItWorks />
      <PetTypes />
      <Footer />
      
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeModal}
        mode={authModal.mode}
        onSwitchMode={switchMode}
      />
    </div>
  );
};

export default App;