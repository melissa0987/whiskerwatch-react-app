import React, { useState, useEffect } from "react";
import { PawPrint, Plus, Edit2, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import AddPetModal from "./AddPet";
import "../../css/dashboard/MyPets.css";

const MyPets = ({ user, pets, error, getPetTypeDisplay, onRefreshPets }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [petTypes, setPetTypes] = useState([]);

  const url = `http://localhost:8080/api/pets/`;

  // Set pet types (using fallback data since API endpoint doesn't exist yet)
  useEffect(() => {
    const fetchPetTypes = async () => {
      try {
        // Try to fetch from API first
        const res = await fetch("http://localhost:8080/api/pet-types");
        if (!res.ok) throw new Error("Failed to load pet types");
        const data = await res.json();
        // Map to match expected format if needed
        const mappedTypes = data.map(type => ({
          id: type.id,
          name: type.typeName || type.name
        }));
        setPetTypes(mappedTypes);
      } catch (err) {
        console.error("Failed to fetch pet types:", err);
        // Use fallback data since API endpoint doesn't exist yet
        setPetTypes([
          { id: 1, name: "Dog" },
          { id: 2, name: "Cat" },
          { id: 3, name: "Bird" },
          { id: 4, name: "Fish" },
          { id: 5, name: "Rabbit" },
          { id: 6, name: "Hamster" },
          { id: 7, name: "Guinea Pig" },
          { id: 8, name: "Reptile" },
          { id: 9, name: "Ferret" },
          { id: 10, name: "Chinchilla" }
        ]);
      }
    };
    fetchPetTypes();
  }, []);

  if (user.customerTypeId !== 1 && user.customerTypeId !== 3) return null;

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleAddPetSuccess = (successMessage) => {
    showMessage(successMessage, "success");
    setShowAddModal(false);
    if (onRefreshPets) onRefreshPets(); // ensure refresh
  };

  const handleDeletePet = async (petId, petName) => {
    if (!window.confirm(`Are you sure you want to delete ${petName}? This action cannot be undone.`)) return;
    
    try {
      const response = await fetch(`${url}${petId}`, { method: "DELETE" });
      if (response.ok) {
        showMessage(`${petName} has been deleted successfully.`, "success");
        if (onRefreshPets) onRefreshPets();
      } else {
        const errorText = await response.text();
        showMessage(`Failed to delete pet: ${errorText || "Unknown error"}`, "error");
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
      showMessage("Network error. Please check your connection.", "error");
    }
  };

  return (
    <div>
      {/* Success/Error Message */}
      {message && (
        <div className={`alert ${messageType === "success" ? "alert-success" : "alert-error"}`}>
          {messageType === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message}
        </div>
      )}

      {/* Header */}
      <div className="mypets-header">
        <h2 className="mypets-title">
          <PawPrint size={24} color="#28a745" />
          My Pets
        </h2>
        <button className="mypets-add-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Add Pet
        </button>
      </div>

      {/* Empty State or Pets */}
      {pets.length === 0 ? (
        <div className="empty-state">
          <PawPrint size={48} color="#dee2e6" />
          <h3 className="empty-title">No pets yet</h3>
          <p className="empty-text">
            {error
              ? "Unable to load pets due to server issues."
              : "Add your first pet to get started with pet sitting bookings!"}
          </p>
          {!error && (
            <button className="mypets-add-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Add Your First Pet
            </button>
          )}
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
            <div key={`pet-${pet.petId || pet.id}`} className="pet-card">
              <div className="pet-card-header">
                <h3 className="pet-name">{pet.name}</h3>
                <div className="pet-actions">
                  <button className="pet-btn btn-edit" title={`Edit ${pet.name}`}>
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="pet-btn btn-delete"
                    title={`Delete ${pet.name}`}
                    onClick={() => handleDeletePet(pet.petId || pet.id, pet.name)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="pet-details">
                <div className="pet-detail">
                  <strong>Type:</strong>{" "}
                  {pet.petTypeName || 
                  (getPetTypeDisplay ? getPetTypeDisplay(pet.typeId) : "Unknown")}
                </div>
                <div className="pet-detail">
                  <strong>Breed:</strong> {pet.breed || "Not specified"}
                </div>
                <div className="pet-detail">
                  <strong>Age:</strong> {pet.age ? `${pet.age} years` : "Not specified"}
                </div>
                <div className="pet-detail">
                  <strong>Weight:</strong> {pet.weight ? `${pet.weight} lbs` : "Not specified"}
                </div>
                {pet.specialInstructions && (
                  <div className="pet-instructions">
                    <strong>Special Instructions:</strong>
                    <p>{pet.specialInstructions}</p>
                  </div>
                )}
                {pet.bookingsCount !== undefined && (
                  <div className="pet-bookings">
                    <strong>{pet.bookingsCount}</strong> booking{pet.bookingsCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Pet Modal */}
      <AddPetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddPetSuccess}
        userId={user.id}
        petTypes={petTypes}  
      />
    </div>
  );
};

export default MyPets;