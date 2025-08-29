import { PawPrint } from "lucide-react";  
import '../../css/homepage/Header.css'; // Custom CSS

// Dynamic Header - shows different content based on user state
const Header = ({ onLogin, onSignup, onLogout, currentUser }) => (
  <header className="header">
    <div className="container header-inner">
      <div className="logo">
        <PawPrint className="icon" />
        <h3>Whisker Watch</h3>
      </div>
      <div className="header-actions">
        {currentUser ? (
          <>
            <span className="welcome-text">Hello, {currentUser.firstName}!</span>
            <button onClick={onLogout} className="btn btn-danger">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={onLogin} className="btn btn-primary">Login</button>
            <button onClick={onSignup} className="btn btn-success">Sign Up</button>
          </>
        )}
      </div>
    </div>
  </header>
);

export default Header;