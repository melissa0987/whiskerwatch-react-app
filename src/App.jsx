import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from "react";
import Homepage from "./pages/Homepage";
import Dashboard from "./pages/Dashboard";

// Main App Component
const App = () => { 
   const [currentUser, setCurrentUser] = useState(null);
   
   // Debug logs
   console.log('App rendering with currentUser:', currentUser);

   const handleLogout = () => {
     console.log('Logout clicked');
     setCurrentUser(null);
   }

   const handleAuthSuccess = (user) => {
     console.log('handleAuthSuccess called with user:', user);
     setCurrentUser(user);
   };

   return (
     <div className="min-h-screen bg-gray-50">
        
       {currentUser ? (
         <Dashboard user={currentUser} onLogout={handleLogout} />
       ) : (
         <Homepage onAuthSuccess={handleAuthSuccess} />
       )}
     </div>
   );
};

export default App;