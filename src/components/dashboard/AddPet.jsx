import React, { useState } from "react";
import { PawPrint, X } from "lucide-react";
import "../../css/dashboard/MyPets.css";

const AddPetModal = ({ isOpen, onClose, onSuccess, userId, petTypes = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    breed: "",
    weight: "",
    specialInstructions: "",
    typeId: "1",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const defaultPetTypes = [
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
  ];

  const availablePetTypes = petTypes.length > 0 ? petTypes : defaultPetTypes;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Pet name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Pet name must not exceed 100 characters";
    }
    if (formData.age && (isNaN(formData.age) || parseInt(formData.age) < 0)) {
      newErrors.age = "Age must be a non-negative number";
    }
    if (formData.breed && formData.breed.length > 100) {
      newErrors.breed = "Breed must not exceed 100 characters";
    }
    if (formData.weight && (isNaN(formData.weight) || parseFloat(formData.weight) < 0)) {
      newErrors.weight = "Weight must be a non-negative number";
    }
    if (!formData.typeId) {
      newErrors.typeId = "Pet type is required";
    }
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const petData = {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        breed: formData.breed.trim() || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        specialInstructions: formData.specialInstructions.trim() || null,
        ownerId: userId,
        typeId: parseInt(formData.typeId),
      };
      const response = await fetch("http://localhost:8080/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(petData),
      });
      if (response.ok) {
        onSuccess("Pet added successfully!");
        handleClose();
      } else {
        const errorText = await response.text();
        setErrors({ submit: errorText || "Failed to add pet" });
      }
    } catch (error) {
      console.error("Error adding pet:", error);
      setErrors({ submit: "Network error. Please check your connection." });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      age: "",
      breed: "",
      weight: "",
      specialInstructions: "",
      typeId: "1",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <PawPrint size={24} color="#28a745" />
            <h3>Add New Pet</h3>
          </div>
          <button className="close-btn" onClick={handleClose} disabled={loading}>
            <X size={20} color="#6c757d" />
          </button>
        </div>

        {/* Pet Name */}
        <div className="form-group">
          <label className="form-label">
            Pet Name <span style={{ color: "#dc3545" }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter pet's name"
            disabled={loading}
          />
          {errors.name && <small className="form-error">{errors.name}</small>}
        </div>

        {/* Pet Type */}
        <div className="form-group">
          <label className="form-label">
            Pet Type <span style={{ color: "#dc3545" }}>*</span>
          </label>
          <select
            name="typeId"
            value={formData.typeId}
            onChange={handleInputChange}
            className="form-select"
            disabled={loading}
          >
            {availablePetTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.typeId && <small className="form-error">{errors.typeId}</small>}
        </div>

        {/* Age + Weight */}
        <div className="form-row">
          <div>
            <label className="form-label">Age (years)</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="e.g., 3"
              className="form-input"
              disabled={loading}
              min="0"
              step="1"
            />
            {errors.age && <small className="form-error">{errors.age}</small>}
          </div>
          <div>
            <label className="form-label">Weight (lbs)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="e.g., 25.5"
              className="form-input"
              disabled={loading}
              min="0"
              step="0.1"
            />
            {errors.weight && <small className="form-error">{errors.weight}</small>}
          </div>
        </div>

        {/* Breed */}
        <div className="form-group">
          <label className="form-label">Breed</label>
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleInputChange}
            placeholder="e.g., Golden Retriever"
            className="form-input"
            disabled={loading}
          />
          {errors.breed && <small className="form-error">{errors.breed}</small>}
        </div>

        {/* Special Instructions */}
        <div className="form-group">
          <label className="form-label">Special Instructions</label>
          <textarea
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Any special care instructions, dietary needs, medications, etc."
            rows="3"
            disabled={loading}
          />
        </div>

        {/* Submit Error */}
        {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

        {/* Buttons */}
        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={handleClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" />
                Adding...
              </>
            ) : (
              <>
                <PawPrint size={14} />
                Add Pet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPetModal;