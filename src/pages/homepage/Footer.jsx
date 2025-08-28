import { PawPrint, Phone, MapPin } from "lucide-react"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Footer.css'; // Custom CSS

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="logo">
        <PawPrint size={24} color="#60a5fa" />
        Whisker Watch
      </div>
      <p>Professional pet sitting services across Montreal.</p>
      <div className="contact">
        <div><Phone size={16} /> 1-800-WHISKER</div>
        <div><MapPin size={16} /> Montreal, QC</div>
      </div>
      <p className="copyright">© 2025 Whisker Watch Pet Sitting Service. All rights reserved.</p>
    </div>
  </footer>
);


export default Footer;