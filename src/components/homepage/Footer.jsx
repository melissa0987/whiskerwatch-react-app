import { PawPrint, Phone, MapPin, Mail, Heart } from "lucide-react"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/homepage/Footer.css'; // Custom CSS

// Dynamic Footer - shows different content based on user state
const Footer = ({ currentUser }) => (
  <footer className="footer">
    <div className="container">
      <div className="logo">
        <PawPrint size={24} color="#60a5fa" />
        Whisker Watch
      </div>
      
      {currentUser ? (
        // Footer for logged-in users
        <>
          <p>Welcome back, {currentUser.firstName}! Your pets are in safe hands.</p>
          <div className="user-footer-info">
            <div className="account-type">
              <Heart size={16} />
              Account: {currentUser.customerTypeId === 1 ? 'Pet Owner' : 
                       currentUser.customerTypeId === 2 ? 'Pet Sitter' : 'Owner & Sitter'}
            </div>
            <div className="support-info">
              <div><Phone size={16} /> Need help? Call 1-800-WHISKER</div>
              <div><Mail size={16} /> support@whiskerwatch.com</div>
            </div>
          </div>
        </>
      ) : (
        // Footer for homepage visitors
        <>
          <p>Professional pet sitting services across Montreal.</p>
          <div className="contact">
            <div><Phone size={16} /> 1-800-WHISKER</div>
            <div><MapPin size={16} /> Montreal, QC</div>
            <div><Mail size={16} /> hello@whiskerwatch.com</div>
          </div>
        </>
      )}
      
      <p className="copyright">© 2025 Whisker Watch Pet Sitting Service. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;