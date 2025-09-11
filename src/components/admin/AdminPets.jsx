import React, { useState, useMemo } from 'react';
import { PawPrint, Search, Filter, User, Calendar, Activity, Eye, Trash2 } from 'lucide-react';
import '../../css/admin/AdminPets.css';
import apiService from '../../services/apiService';


const AdminPets = ({ dashboardData, loading, refreshData }) => {
  const { pets, users } = dashboardData;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPet, setSelectedPet] = useState(null);
  const [showPetModal, setShowPetModal] = useState(false);

  // Filter and search pets
  const filteredPets = useMemo(() => {
    let filtered = [...pets];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(pet => 
        pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.petTypeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(pet => {
        switch (filterType) {
          case 'active': return pet.isActive === true;
          case 'inactive': return pet.isActive === false;
          case 'dog': return pet.petTypeName?.toLowerCase() === 'dog';
          case 'cat': return pet.petTypeName?.toLowerCase() === 'cat';
          case 'bird': return pet.petTypeName?.toLowerCase() === 'bird';
          case 'other': return !['dog', 'cat', 'bird'].includes(pet.petTypeName?.toLowerCase());
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [pets, searchTerm, filterType, sortBy, sortOrder]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const handlePetClick = (pet) => {
    setSelectedPet(pet);
    setShowPetModal(true);
  };

  const handleDeletePet = async (petId, petName) => {
    if (!window.confirm(`Are you sure you want to delete pet "${petName}"? This action cannot be undone and will also delete all associated bookings.`)) {
      return;
    }

    try {
      console.log(`Deleting pet ${petId}`);

      await apiService.deletePetAsAdmin(petId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };

  const getPetTypeIcon = (petType) => {
    switch (petType?.toLowerCase()) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'fish': return '🐠';
      case 'rabbit': return '🐰';
      case 'hamster': return '🐹';
      case 'guinea pig': return '🐹';
      case 'reptile': return '🦎';
      default: return '🐾';
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading pets...</p>
      </div>
    );
  }

  return (
    <div className="admin-pets">
      <div className="admin-page-header">
        <h2 className="admin-page-title">
          <PawPrint size={24} />
          Pets Management
        </h2>
        <div className="admin-page-stats">
          <span className="stat-item">Total: {pets.length}</span>
          <span className="stat-item">Active: {pets.filter(p => p.isActive).length}</span>
          <span className="stat-item">Filtered: {filteredPets.length}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-controls">
        <div className="search-control">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search pets by name, breed, type, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Pets</option>
              <option value="active">Active Pets</option>
              <option value="inactive">Inactive Pets</option>
              <option value="dog">Dogs</option>
              <option value="cat">Cats</option>
              <option value="bird">Birds</option>
              <option value="other">Other Types</option>
            </select>
          </div>

          <div className="sort-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="createdAt">Date Added</option>
              <option value="name">Pet Name</option>
              <option value="petTypeName">Pet Type</option>
              <option value="ownerName">Owner Name</option>
              <option value="age">Age</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-toggle"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Pets Grid */}
      <div className="admin-pets-grid">
        {filteredPets.map((pet) => (
          <div key={pet.petId} className="admin-pet-card" onClick={() => handlePetClick(pet)}>
            <div className="pet-card-header">
              <div className="pet-icon">
                {getPetTypeIcon(pet.petTypeName)}
              </div>
              <div className="pet-basic-info">
                <h3 className="pet-name">{pet.name}</h3>
                <span className="pet-type">{pet.petTypeName}</span>
              </div>
              <div className="pet-status">
                <span className={`status-indicator ${pet.isActive ? 'active' : 'inactive'}`}>
                  {pet.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="pet-card-body">
              <div className="pet-details">
                <div className="detail-row">
                  <span className="detail-label">Breed:</span>
                  <span className="detail-value">{pet.breed || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{pet.age ? `${pet.age} years` : 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Weight:</span>
                  <span className="detail-value">{pet.weight ? `${pet.weight} lbs` : 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Owner:</span>
                  <span className="detail-value">{pet.ownerName || 'Unknown'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Bookings:</span>
                  <span className="detail-value">{pet.bookingsCount || 0}</span>
                </div>
              </div>

              {pet.specialInstructions && (
                <div className="pet-instructions">
                  <strong>Special Instructions:</strong>
                  <p>{pet.specialInstructions}</p>
                </div>
              )}
            </div>

            <div className="pet-card-footer">
              <div className="pet-meta">
                <Calendar size={14} />
                <span>Added {formatDate(pet.createdAt)}</span>
              </div>
              <div className="pet-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handlePetClick(pet)}
                  className="action-btn view"
                  title="View details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleDeletePet(pet.petId, pet.name)}
                  className="action-btn delete"
                  title="Delete pet"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPets.length === 0 && (
        <div className="no-results">
          <PawPrint size={48} />
          <h3>No pets found</h3>
          <p>Try adjusting your search criteria or filters.</p>
        </div>
      )}

      {/* Pet Detail Modal */}
      {showPetModal && selectedPet && (
        <div className="modal-overlay" onClick={() => setShowPetModal(false)}>
          <div className="modal-content pet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {getPetTypeIcon(selectedPet.petTypeName)} {selectedPet.name} Details
              </h3>
              <button className="close-btn" onClick={() => setShowPetModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="pet-detail-grid">
                <div className="detail-section">
                  <h4>Pet Information</h4>
                  <div className="detail-item">
                    <strong>Name:</strong> {selectedPet.name}
                  </div>
                  <div className="detail-item">
                    <strong>Type:</strong> {selectedPet.petTypeName}
                  </div>
                  <div className="detail-item">
                    <strong>Breed:</strong> {selectedPet.breed || 'Not specified'}
                  </div>
                  <div className="detail-item">
                    <strong>Age:</strong> {selectedPet.age ? `${selectedPet.age} years` : 'Not specified'}
                  </div>
                  <div className="detail-item">
                    <strong>Weight:</strong> {selectedPet.weight ? `${selectedPet.weight} lbs` : 'Not specified'}
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong> 
                    <span className={`status-badge ${selectedPet.isActive ? 'active' : 'inactive'}`}>
                      {selectedPet.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Owner Information</h4>
                  <div className="detail-item">
                    <strong>Owner:</strong> {selectedPet.ownerName || 'Unknown'}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {selectedPet.ownerEmail || 'Not available'}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Activity</h4>
                  <div className="detail-item">
                    <strong>Total Bookings:</strong> {selectedPet.bookingsCount || 0}
                  </div>
                  <div className="detail-item">
                    <strong>Date Added:</strong> {formatDate(selectedPet.createdAt)}
                  </div>
                </div>

                {selectedPet.specialInstructions && (
                  <div className="detail-section full-width">
                    <h4>Special Instructions</h4>
                    <div className="special-instructions-content">
                      {selectedPet.specialInstructions}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPets;