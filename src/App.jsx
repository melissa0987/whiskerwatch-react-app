import { useState } from "react"; 
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';


import Header from "./pages/homepage/Header"; 
import AuthModal from "./auth/AuthModal";
import Hero from "./pages/homepage/Hero";
import HowItWorks from "./pages/homepage/HowItWorks";

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
      
       <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeModal}
        mode={authModal.mode}
        onSwitchMode={switchMode}
      />

      <Hero/>
      <HowItWorks/>
    </div>
  );
};

export default App;