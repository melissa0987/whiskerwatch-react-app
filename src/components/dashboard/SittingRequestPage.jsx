// SittingRequestPage.js
import React, { useState } from 'react';
import OwnerView from './OwnerView';
import SitterView from './SitterView';
import '../../css/dashboard/SittingRequestPage.css';

const SittingRequestPage = ({ user, ...props }) => {
  const [viewMode, setViewMode] = useState(
    user.customerTypeId === 1 ? 'owner' : 'sitter'
  );

  if (!user) return <p>Please log in to view sitting requests.</p>;

  // If user is "Both", allow switching between views
  if (user.customerTypeId === 3) {
    return (
      <div>
        <div className="toggle-buttons">
          <button
            onClick={() => setViewMode('owner')}
            className={viewMode === 'owner' ? 'active' : ''}
          >
            Owner View
          </button>
          <button
            onClick={() => setViewMode('sitter')}
            className={viewMode === 'sitter' ? 'active' : ''}
          >
            Sitter View
          </button>
        </div>

        {viewMode === 'owner' ? (
          <OwnerView user={user} {...props} />
        ) : (
          <SitterView user={user} {...props} />
        )}
      </div>
    );
  }

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
