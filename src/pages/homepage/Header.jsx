import { PawPrint } from "lucide-react";  
import '../../css/Header.css'; // Custom CSS

// Header
const Header = ({ onLogin, onSignup, currentUser }) => (
  <header className="header">
    <div className="container header-inner">
      <div className="logo">
        <PawPrint className="icon" />
        <span>Whisker Watch</span>
      </div>
      <div className="header-actions">
        {currentUser ? (
          <span>Welcome, {currentUser.firstName}!</span>
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