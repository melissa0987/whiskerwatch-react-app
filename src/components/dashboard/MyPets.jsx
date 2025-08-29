import React from 'react';
import { PawPrint, Plus, Edit2, Trash2 } from 'lucide-react';

const MyPets = ({ user, pets, error, getPetTypeDisplay }) => {
  // Only show this component for owners
  if (user.customerTypeId !== 1 && user.customerTypeId !== 3) {
    return null;
  }

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">My Pets</h2>
        <button className="btn btn-success">
          <Plus size={16} />
          Add Pet
        </button>
      </div>

      {pets.length === 0 ? (
        <div className="empty-state">
          <PawPrint size={48} color="#dee2e6" />
          <p>
            {error ? 'Unable to load pets due to server connection issues.' : 'No pets added yet. Add your first pet to get started!'}
          </p>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map(pet => (
            <div key={`pet-${pet.id}`} className="pet-card">
              <div className="pet-card-header">
                <h3 className="pet-card-title">{pet.name}</h3>
                <div className="pet-card-actions">
                  <button className="btn btn-outline" aria-label={`Edit ${pet.name}`}>
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-outline-danger" aria-label={`Delete ${pet.name}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="pet-card-details">
                <p><strong>Type:</strong> {getPetTypeDisplay(pet.typeId)}</p>
                <p><strong>Breed:</strong> {pet.breed || 'Not specified'}</p>
                <p><strong>Age:</strong> {pet.age} years old</p>
                <p><strong>Weight:</strong> {pet.weight ? `${pet.weight} lbs` : 'Not specified'}</p>
                {pet.specialInstructions && (
                  <p className="special-instructions">
                    <strong>Special Instructions:</strong> {pet.specialInstructions}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPets;