import { PawPrint } from "lucide-react";  
import '../../css/Homepage.css'; // Custom CSS

// Header
const Header = ({ onLogin, onSignup }) => (
  <header className="header">
    <div className="container header-inner">
      <div className="logo">
        <PawPrint className="icon" />
        <span>Whisker Watch</span>
      </div>
      <div className="header-actions">
        <button onClick={onLogin} className="btn btn-primary">Login</button>
        <button onClick={onSignup} className="btn btn-success">Sign Up</button>
      </div>
    </div>
  </header>
);

export default Header;