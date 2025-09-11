// SittingRequestPage.js

import OwnerView from './OwnerView';
import SitterView from './SitterView';
import '../../css/dashboard/SittingRequestPage.css';

const SittingRequestPage = ({ user, ...props }) => {
 

  if (!user) return <p>Please log in to view sitting requests.</p>;



  // Owner-only
  if (user.customerTypeId === 1) {
    return <OwnerView user={user} {...props} />;
  }

  // Sitter-only
  if (user.customerTypeId === 2) {
    return <SitterView user={user} {...props} />;
  }

  return <p>Unknown user type.</p>;
};

export default SittingRequestPage;
