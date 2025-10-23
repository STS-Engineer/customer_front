// CustomerManagement.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; 
import './CustomerManagement.css';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isCompleteCustomerModalOpen, setIsCompleteCustomerModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    groupe_name: '',
    Description: ''
  });
  const [completeCustomerData, setCompleteCustomerData] = useState({
    group: {
      groupe_name: '',
      Description: ''
    },
    units: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingCustomer, setEditingCustomer] = useState(null);




  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter((c) =>
        c.groupe_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://customer-back.azurewebsites.net/ajouter/api/groups');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitDetails = async (unitId) => {
    try {
      const response = await fetch(`https://customer-back.azurewebsites.net/ajouter/api/units/${unitId}`);
      if (!response.ok) throw new Error('Failed to fetch unit details');
      const unitData = await response.json();
      setSelectedUnit(unitData);
      setIsUnitModalOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };



  const openCompleteCustomerModal = () => {
    setEditingCustomer(null);
    setCompleteCustomerData({
      group: {
        groupe_name: '',
        Description: ''
      },
      units: []
    });
    setFormErrors({});
    setIsCompleteCustomerModalOpen(true);
  };

  const openEditGroupModal = (group) => {
    setSelectedGroup(group);
    setFormData({
      groupe_name: group.groupe_name,
      Description: group.Description || ''
    });
    setFormErrors({});
    setIsGroupModalOpen(true);
  };

  const openEditCompleteCustomerModal = async (customer) => {
    try {
      setLoading(true);
      
      // Fetch detailed customer data with units and responsible persons
      const response = await fetch(`https://customer-back.azurewebsites.net/ajouter/api/groups/${customer.groupe_id}/complete`);
      if (!response.ok) throw new Error('Failed to fetch customer details');
      
      const customerData = await response.json();
      
      console.log('Fetched customer data:', customerData); // Debug log
      
      setEditingCustomer(customerData);
      setCompleteCustomerData({
        group: {
          groupe_name: customerData.groupe_name,
          Description: customerData.Description || ''
        },
        units: customerData.units.map(unit => ({
          unit_id: unit.unit_id,
          unit_name: unit.unit_name,
          city: unit.city || '',
          country: unit.country || '',
          zone_name: unit.zone_name || '',
          responsible: unit.responsible ? {
            Person_id: unit.responsible.Person_id,
            first_name: unit.responsible.first_name || '',
            last_name: unit.responsible.last_name || '',
            job_title: unit.responsible.job_title || '',
            email: unit.responsible.email || '',
            phone_number: unit.responsible.phone_number || '',
            role: unit.responsible.role || 'Contact',
            zone_name: unit.responsible.zone_name || ''
          } : {
            Person_id: null,
            first_name: '',
            last_name: '',
            job_title: '',
            email: '',
            phone_number: '',
            role: 'Contact',
            zone_name: ''
          }
        }))
      });
      
      setFormErrors({});
      setIsCompleteCustomerModalOpen(true);
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteGroupModal = (group) => {
    setGroupToDelete(group);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsUnitModalOpen(false);
    setIsGroupModalOpen(false);
    setIsCompleteCustomerModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUnit(null);
    setSelectedGroup(null);
    setGroupToDelete(null);
    setEditingCustomer(null);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCompleteCustomerChange = (path, value) => {
    setCompleteCustomerData(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleUnitChange = (unitIndex, field, value) => {
    setCompleteCustomerData(prev => {
      const updated = { ...prev };
      updated.units[unitIndex] = { ...updated.units[unitIndex] };
      updated.units[unitIndex][field] = value;
      return updated;
    });
  };

  const handleResponsibleChange = (unitIndex, field, value) => {
    setCompleteCustomerData(prev => {
      const updated = { ...prev };
      updated.units[unitIndex] = { ...updated.units[unitIndex] };
      updated.units[unitIndex].responsible = { ...updated.units[unitIndex].responsible };
      updated.units[unitIndex].responsible[field] = value;
      return updated;
    });
  };

  const addUnit = () => {
    setCompleteCustomerData(prev => ({
      ...prev,
      units: [
        ...prev.units,
        {
          unit_name: '',
          city: '',
          country: '',
          zone_name: '',
          responsible: {
            Person_id: null,
            first_name: '',
            last_name: '',
            job_title: '',
            email: '',
            phone_number: '',
            role: 'Contact',
            zone_name: ''
          }
        }
      ]
    }));
  };

  const removeUnit = (index) => {
    if (completeCustomerData.units.length > 1 || !editingCustomer) {
      setCompleteCustomerData(prev => ({
        ...prev,
        units: prev.units.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.groupe_name.trim()) {
      errors.groupe_name = 'Group name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCompleteCustomer = () => {
    const errors = {};
    
    if (!completeCustomerData.group.groupe_name.trim()) {
      errors.group_name = 'Group name is required';
    }
    
    completeCustomerData.units.forEach((unit, index) => {
      if (!unit.unit_name.trim()) {
        errors[`unit_${index}_name`] = `Unit ${index + 1} name is required`;
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitGroup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = selectedGroup 
        ? `https://customer-back.azurewebsites.net/ajouter/api/groups/${selectedGroup.groupe_id}`
        : 'https://customer-back.azurewebsites.net/ajouter/api/groups';
      
      const method = selectedGroup ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save group');
      }
         console.log('🔥 Toast launched: Group created/updated');
         toast.success(selectedGroup ? 'Customer updated successfully!' : 'Customer created successfully!', 'success');
      await fetchCustomers();
      closeModals();
 
    } catch (err) {
      setError(err.message);
      
    }
  };

  const handleSubmitCompleteCustomer = async (e) => {
    e.preventDefault();
    if (!validateCompleteCustomer()) return;

    try {
      setLoading(true);
      
      if (editingCustomer) {
        // UPDATE EXISTING CUSTOMER
        // 1. Update the group
        const groupResponse = await fetch(`https://customer-back.azurewebsites.net/ajouter/api/groups/${editingCustomer.groupe_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(completeCustomerData.group),
        });

        if (!groupResponse.ok) {
          const errorData = await groupResponse.json();
          throw new Error(errorData.error || 'Failed to update group');
        }

        // 2. Update or create units
        const unitPromises = completeCustomerData.units.map(async (unit) => {
          const unitData = {
            groupe_id: editingCustomer.groupe_id,
            unit_name: unit.unit_name,
            city: unit.city || null,
            country: unit.country || null,
            zone_name: unit.zone_name || null,
            com_person_id: unit.responsible?.Person_id || null
          };

          if (unit.unit_id) {
            // Update existing unit
            const unitResponse = await fetch(`https://customer-back.azurewebsites.net/ajouter/api/units/${unit.unit_id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(unitData),
            });

            if (!unitResponse.ok) {
              const errorData = await unitResponse.json();
              throw new Error(`Failed to update unit ${unit.unit_name}: ${errorData.error || 'Unknown error'}`);
            }

            return unitResponse.json();
          } else {
            // Create new unit
            const unitResponse = await fetch('https://customer-back.azurewebsites.net/ajouter/api/units', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(unitData),
            });

            if (!unitResponse.ok) {
              const errorData = await unitResponse.json();
              throw new Error(`Failed to create unit ${unit.unit_name}: ${errorData.error || 'Unknown error'}`);
            }

            return unitResponse.json();
          }
        });

        // Wait for all units to be updated/created
        await Promise.all(unitPromises);
        console.log('🔥 Toast launched: Group created/updated');

         toast.success('Customer updated successfully!', 'success');
      } else {
        // CREATE NEW CUSTOMER
        // 1. First create the group
        const groupResponse = await fetch('https://customer-back.azurewebsites.net/ajouter/api/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(completeCustomerData.group),
        });

        if (!groupResponse.ok) {
          const errorData = await groupResponse.json();
          throw new Error(errorData.error || 'Failed to create group');
        }

        const groupData = await groupResponse.json();
        const groupId = groupData.groupe_id;

        // 2. Then create each unit for this group
        const unitPromises = completeCustomerData.units.map(async (unit) => {
          const unitData = {
            groupe_id: groupId,
            unit_name: unit.unit_name,
            city: unit.city || null,
            country: unit.country || null,
            zone_name: unit.zone_name || null,
            com_person_id: unit.responsible?.Person_id || null
          };

          const unitResponse = await fetch('https://customer-back.azurewebsites.net/ajouter/api/units', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(unitData),
          });

          if (!unitResponse.ok) {
            const errorData = await unitResponse.json();
            throw new Error(`Failed to create unit ${unit.unit_name}: ${errorData.error || 'Unknown error'}`);
          }

          return unitResponse.json();
        });

        // Wait for all units to be created
        await Promise.all(unitPromises);

      
      }
      console.log('🔥 Toast launched: Group created')
      toast.success('Customer created successfully!', 'success');
      // Refresh the customers list
      await fetchCustomers();
      closeModals();
      
    } catch (err) {
      console.error('Error saving customer:', err);
      setError(err.message);
    
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      const response = await fetch(`https://customer-back.azurewebsites.net/ajouter/api/groups/${groupToDelete.groupe_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete group');
      }
      console.log('🔥 Toast launched: Group created/updated');
      toast.success('Group and associated units deleted successfully!', 'success');
      await fetchCustomers();
      closeModals();

    } catch (err) {
      setError(err.message);
      
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchCustomers} className="retry-btn">
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-management">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <i className="fas fa-users"></i>
            <h1>Customer Management</h1>
          </div>
          <p className="header-subtitle">
            Manage your customers and their units efficiently
          </p>

          <div className="header-actions">
            {/* Search Filter */}
            <div className="customer-filter-container">
              <div className="customer-filter">
                <input
                  type="text"
                  placeholder="Search customers by group name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="btn-primary" onClick={openCompleteCustomerModal}>
                <i className="fas fa-user-plus"></i>
                Add Complete Customer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="customers-grid">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.groupe_id}
              customer={customer}
              onUnitClick={fetchUnitDetails}
              onEditGroupClick={openEditGroupModal}
              onEditCompleteClick={openEditCompleteCustomerModal}
              onDeleteClick={openDeleteGroupModal}
            />
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h3>No Customers Found</h3>
            <p>No customers match your search criteria.</p>
            <button className="btn-primary" onClick={openCompleteCustomerModal}>
              <i className="fas fa-user-plus"></i>
              Add Your First Customer
            </button>
          </div>
        )}
      </main>

      {/* Unit Details Modal */}
      {isUnitModalOpen && <UnitModal unit={selectedUnit} onClose={closeModals} />}

      {/* Group Form Modal */}
      {isGroupModalOpen && (
        <GroupModal
          group={selectedGroup}
          formData={formData}
          formErrors={formErrors}
          onInputChange={handleInputChange}
          onSubmit={handleSubmitGroup}
          onClose={closeModals}
        />
      )}

      {/* Complete Customer Modal */}
      {isCompleteCustomerModalOpen && (
        <CompleteCustomerModal
          data={completeCustomerData}
          formErrors={formErrors}
          onGroupChange={handleCompleteCustomerChange}
          onUnitChange={handleUnitChange}
          onResponsibleChange={handleResponsibleChange}
          onAddUnit={addUnit}
          onRemoveUnit={removeUnit}
          onSubmit={handleSubmitCompleteCustomer}
          onClose={closeModals}
          isEditing={!!editingCustomer}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          group={groupToDelete}
          onConfirm={handleDeleteGroup}
          onClose={closeModals}
        />
      )}
      
   
    </div>
  );
};

// Complete Customer Modal Component
const CompleteCustomerModal = ({ 
  data, 
  formErrors, 
  onGroupChange, 
  onUnitChange, 
  onResponsibleChange, 
  onAddUnit, 
  onRemoveUnit, 
  onSubmit, 
  onClose,
  isEditing = false
}) => {
  const [persons, setPersons] = useState([]);
  const [loadingPersons, setLoadingPersons] = useState(true);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        setLoadingPersons(true);
        const response = await fetch('https://customer-back.azurewebsites.net/ajouter/api/persons/by-domain?domain=avocarbon.com');
        if (!response.ok) throw new Error('Failed to fetch persons');
        const personsData = await response.json();
        setPersons(personsData);
      } catch (error) {
        console.error('Error fetching persons:', error);
        setPersons([]);
      } finally {
        setLoadingPersons(false);
      }
    };

    fetchPersons();
  }, []);

  const addFirstUnit = () => {
    onAddUnit();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <i className={isEditing ? "fas fa-edit" : "fas fa-user-plus"}></i>
            <h2>{isEditing ? 'Edit Complete Customer' : 'Add Complete Customer'}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={onSubmit} className="modal-form">
          {/* Group Information */}
          <div className="form-section">
            <h3>
              <i className="fas fa-users"></i> Group Information
            </h3>
            <div className="form-group">
              <label htmlFor="group_name" className="form-label">
                Group Name *
              </label>
              <input
                type="text"
                id="group_name"
                value={data.group.groupe_name}
                onChange={(e) => onGroupChange('group.groupe_name', e.target.value)}
                className={`form-input ${formErrors.group_name ? 'error' : ''}`}
                placeholder="Enter group name"
              />
              {formErrors.group_name && (
                <span className="error-message">{formErrors.group_name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="group_description" className="form-label">
                Description
              </label>
              <textarea
                id="group_description"
                value={data.group.Description}
                onChange={(e) => onGroupChange('group.Description', e.target.value)}
                className="form-textarea"
                placeholder="Enter group description (optional)"
                rows="3"
              />
            </div>
          </div>

          {/* Units Section */}
          <div className="form-section">
            <div className="section-header">
              <h3>
                <i className="fas fa-industry"></i> Units
                <span className="units-count">({data.units.length})</span>
              </h3>
              <button type="button" className="btn-primary btn-sm" onClick={addFirstUnit}>
                <i className="fas fa-plus"></i> Add Unit
              </button>
            </div>

            {/* Empty State for Units */}
            {data.units.length === 0 && (
              <div className="empty-units-state">
                <div className="empty-units-icon">
                  <i className="fas fa-industry"></i>
                </div>
                <h4>No Units Added Yet</h4>
                <p>Start by adding your first unit to this customer group</p>
              
              </div>
            )}

            {/* Units List */}
            {data.units.map((unit, unitIndex) => (
              <div key={unitIndex} className="unit-form-section">
                <div className="unit-header">
                  <h4>
                    <i className="fas fa-factory"></i>
                    Unit {unitIndex + 1}
                    {unit.unit_id && <span className="unit-id-badge"> (ID: {unit.unit_id})</span>}
                  </h4>
                  <button 
                    type="button" 
                    className="btn-icon btn-delete" 
                    onClick={() => onRemoveUnit(unitIndex)}
                    title="Remove Unit"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`unit_name_${unitIndex}`} className="form-label">
                      Unit Name *
                    </label>
                    <input
                      type="text"
                      id={`unit_name_${unitIndex}`}
                      value={unit.unit_name}
                      onChange={(e) => onUnitChange(unitIndex, 'unit_name', e.target.value)}
                      className={`form-input ${formErrors[`unit_${unitIndex}_name`] ? 'error' : ''}`}
                      placeholder="Enter unit name"
                    />
                    {formErrors[`unit_${unitIndex}_name`] && (
                      <span className="error-message">{formErrors[`unit_${unitIndex}_name`]}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`unit_city_${unitIndex}`} className="form-label">
                      City
                    </label>
                    <input
                      type="text"
                      id={`unit_city_${unitIndex}`}
                      value={unit.city}
                      onChange={(e) => onUnitChange(unitIndex, 'city', e.target.value)}
                      className="form-input"
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`unit_country_${unitIndex}`} className="form-label">
                      Country
                    </label>
                    <input
                      type="text"
                      id={`unit_country_${unitIndex}`}
                      value={unit.country}
                      onChange={(e) => onUnitChange(unitIndex, 'country', e.target.value)}
                      className="form-input"
                      placeholder="Enter country"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor={`unit_zone_${unitIndex}`} className="form-label">
                    Zone
                  </label>
                  <input
                    type="text"
                    id={`unit_zone_${unitIndex}`}
                    value={unit.zone_name}
                    onChange={(e) => onUnitChange(unitIndex, 'zone_name', e.target.value)}
                    className="form-input"
                    placeholder="Enter zone"
                  />
                </div>

                {/* Responsible Person Section with Dropdown */}
                <div className="responsible-section">
                  <div className="responsible-header">
                    <h5>
                      <i className="fas fa-user-tie"></i> Responsible Person
                    </h5>
                    <span className="optional-badge">Optional</span>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`responsible_person_${unitIndex}`} className="form-label">
                      Select Responsible Person
                    </label>
                    {loadingPersons ? (
                      <div className="loading-dropdown">
                        <i className="fas fa-spinner fa-spin"></i>
                        Loading persons from @avocarbon.com...
                      </div>
                    ) : persons.length > 0 ? (
                      <select
                        id={`responsible_person_${unitIndex}`}
                        value={unit.responsible?.Person_id || ''}
                        onChange={(e) => {
                          const selectedPersonId = e.target.value;
                          if (selectedPersonId) {
                            const selectedPerson = persons.find(p => p.Person_id === parseInt(selectedPersonId));
                            if (selectedPerson) {
                              // Set all responsible fields from the selected person
                              onResponsibleChange(unitIndex, 'Person_id', selectedPerson.Person_id);
                              onResponsibleChange(unitIndex, 'first_name', selectedPerson.first_name);
                              onResponsibleChange(unitIndex, 'last_name', selectedPerson.last_name);
                              onResponsibleChange(unitIndex, 'job_title', selectedPerson.job_title || '');
                              onResponsibleChange(unitIndex, 'email', selectedPerson.email);
                              onResponsibleChange(unitIndex, 'phone_number', selectedPerson.phone_number || '');
                              onResponsibleChange(unitIndex, 'role', selectedPerson.role || 'Contact');
                              onResponsibleChange(unitIndex, 'zone_name', selectedPerson.zone_name || '');
                            }
                          } else {
                            // Clear all responsible fields
                            onResponsibleChange(unitIndex, 'Person_id', null);
                            onResponsibleChange(unitIndex, 'first_name', '');
                            onResponsibleChange(unitIndex, 'last_name', '');
                            onResponsibleChange(unitIndex, 'job_title', '');
                            onResponsibleChange(unitIndex, 'email', '');
                            onResponsibleChange(unitIndex, 'phone_number', '');
                            onResponsibleChange(unitIndex, 'role', 'Contact');
                            onResponsibleChange(unitIndex, 'zone_name', '');
                          }
                        }}
                        className="form-input"
                      >
                        <option value="">No responsible person</option>
                        {persons.map((person) => (
                          <option key={person.Person_id} value={person.Person_id}>
                            {person.first_name} {person.last_name} 
                            {person.job_title && ` - ${person.job_title}`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="no-persons-message">
                        <i className="fas fa-users-slash"></i>
                        No persons found with @avocarbon.com email
                      </div>
                    )}
                  </div>

                  {/* Display selected person info */}
                  {unit.responsible?.Person_id && (
                    <div className="selected-person-info">
                      <div className="selected-person-card">
                        <div className="person-badge">
                          <i className="fas fa-user-check"></i>
                          <span>
                            <strong>{unit.responsible.first_name} {unit.responsible.last_name}</strong>
                            {unit.responsible.job_title && ` • ${unit.responsible.job_title}`}
                            {unit.responsible.role && ` • ${unit.responsible.role}`}
                          </span>
                        </div>
                        <div className="person-contact">
                          {unit.responsible.email && (
                            <span className="contact-item">
                              <i className="fas fa-envelope"></i>
                              {unit.responsible.email}
                            </span>
                          )}
                          {unit.responsible.phone_number && (
                            <span className="contact-item">
                              <i className="fas fa-phone"></i>
                              {unit.responsible.phone_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Unit Button at Bottom */}
            {data.units.length > 0 && (
              <div className="add-unit-footer">
                <button type="button" className="btn-secondary" onClick={onAddUnit}>
                  <i className="fas fa-plus"></i>
                  Add Another Unit
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              <i className="fas fa-times"></i>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <i className="fas fa-save"></i> 
              {isEditing 
                ? 'Update Customer' 
                : (data.units.length === 0 ? 'Create Group Only' : 'Create Complete Customer')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Customer Card Component
const CustomerCard = ({ customer, onUnitClick, onEditGroupClick, onEditCompleteClick, onDeleteClick }) => {
  const fallbackCategory = customer.Description?.toLowerCase().includes('automobile') ? 'automobile' : 'industry';
  const { clearbitUrl, googleFaviconUrl, genericFallback } = getCompanyLogo(customer.groupe_name, fallbackCategory);

  const [unitSearchTerm, setUnitSearchTerm] = useState('');

  const filteredUnits = customer.units.filter((unit) =>
    unit.unit_name.toLowerCase().includes(unitSearchTerm.toLowerCase())
  );

  return (
    <div className="customer-card">
      <div className="customer-header">
        <div className="customer-icon">
          <img
            src={clearbitUrl}
            alt={`${customer.groupe_name} logo`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = googleFaviconUrl;
              e.target.onError = () => (e.target.src = genericFallback);
            }}
            className="customer-logo"
          />
        </div>

        <div className="customer-info">
          <div className="customer-title-section">
            <h3 className="customer-name">{customer.groupe_name}</h3>
            <div className="customer-actions">
  <button 
    className="btn-icon btn-edit" 
    onClick={() => onEditCompleteClick(customer)}
    title="Edit Complete Customer"
  >
    <i className="fas fa-edit fa-sm"></i>
  </button>
  <button 
    className="btn-icon btn-delete" 
    onClick={() => onDeleteClick(customer)}
    title="Delete Group"
  >
    <i className="fas fa-trash-alt fa-sm"></i>
  </button>
</div>
          </div>

          {customer.Description && (
            <p className="customer-description">{customer.Description}</p>
          )}

          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Search units..."
              className="customer-input"
              value={unitSearchTerm}
              onChange={(e) => setUnitSearchTerm(e.target.value)}
            />
            <span className="input-icon">🔍</span>
          </div>
        </div>
      </div>

      <div className="units-section">
        <div className="units-header">
          <h4>
            <i className="fas fa-industry"></i>
            Units ({filteredUnits.length})
          </h4>
        </div>
        <div className="units-list">
          {filteredUnits.length > 0 ? (
            filteredUnits.map((unit) => (
              <UnitItem
                key={unit.unit_id}
                unit={unit}
                onClick={() => onUnitClick(unit.unit_id)}
              />
            ))
          ) : (
            <p className="no-units">No units found</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Group Form Modal Component
const GroupModal = ({ group, formData, formErrors, onInputChange, onSubmit, onClose }) => {
  const isEditing = !!group;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <i className="fas fa-users"></i>
            <h2>{isEditing ? 'Edit Group' : 'Create New Group'}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="groupe_name" className="form-label">
              Group Name *
            </label>
            <input
              type="text"
              id="groupe_name"
              name="groupe_name"
              value={formData.groupe_name}
              onChange={onInputChange}
              className={`form-input ${formErrors.groupe_name ? 'error' : ''}`}
              placeholder="Enter group name"
            />
            {formErrors.groupe_name && (
              <span className="error-message">{formErrors.groupe_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="Description" className="form-label">
              Description
            </label>
            <textarea
              id="Description"
              name="Description"
              value={formData.Description}
              onChange={onInputChange}
              className="form-textarea"
              placeholder="Enter group description (optional)"
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteModal = ({ group, onConfirm, onClose }) => {
  if (!group) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <i className="fas fa-exclamation-triangle warning-icon"></i>
            <h2>Delete Group</h2>
          </div>
        </div>

        <div className="modal-body">
          <p>Are you sure you want to delete the group <strong>"{group.groupe_name}"</strong>?</p>
          {group.units && group.units.length > 0 && (
            <div className="warning-message">
              <i className="fas fa-exclamation-circle"></i>
              <span>This group has {group.units.length} unit(s). Deleting it will also remove all associated units.</span>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            Delete Group
          </button>
        </div>
      </div>
    </div>
  );
};

// Unit Item Component
const UnitItem = ({ unit, onClick }) => (
  <div className="unit-item" onClick={onClick}>
    <div className="unit-info">
      <div className="unit-name">
        <i className="fas fa-factory"></i>
        {unit.unit_name}
      </div>
      <div className="unit-details">
        {unit.city && (
          <span className="unit-location">
            <i className="fas fa-map-marker-alt"></i>
            {unit.city}
            {unit.country && `, ${unit.country}`}
          </span>
        )}
        {unit.zone_name && (
          <span className="unit-zone">
            <i className="fas fa-map"></i>
            {unit.zone_name}
          </span>
        )}
      </div>
    </div>
    <div className="unit-arrow">
      <i className="fas fa-chevron-right"></i>
    </div>
  </div>
);

// Unit Modal Component
const UnitModal = ({ unit, onClose }) => {
  if (!unit) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <i className="fas fa-factory"></i>
            <h2>{unit.unit_name}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>
              <i className="fas fa-info-circle"></i> Unit Information
            </h3>
            <div className="detail-grid">
              <DetailItem label="Unit Name" value={unit.unit_name} />
              <DetailItem label="Group" value={unit.groupe_name} />
              <DetailItem label="City" value={unit.city} />
              <DetailItem label="Country" value={unit.country} />
              <DetailItem label="Zone" value={unit.zone_name} />
              <DetailItem label="Unit ID" value={unit.unit_id} />
            </div>
          </div>

          {unit.responsible && (
            <div className="detail-section">
              <h3>
                <i className="fas fa-user-tie"></i> Responsible Person
              </h3>
              <div className="responsible-card">
                <div className="responsible-header">
                  <div className="person-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="person-info">
                    <h4>
                      {unit.responsible.first_name} {unit.responsible.last_name}
                    </h4>
                    <p className="person-role">
                      <span
                        className={`role-badge ${unit.responsible.role?.toLowerCase()}`}
                      >
                        {unit.responsible.role}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="person-details">
                  <DetailItem
                    label="Job Title"
                    value={unit.responsible.job_title}
                    icon="fas fa-briefcase"
                  />
                  <DetailItem
                    label="Email"
                    value={unit.responsible.email}
                    icon="fas fa-envelope"
                    isEmail
                  />
                  <DetailItem
                    label="Phone"
                    value={unit.responsible.phone_number}
                    icon="fas fa-phone"
                    isPhone
                  />
                  <DetailItem
                    label="Zone"
                    value={unit.responsible.zone_name}
                    icon="fas fa-map-marker-alt"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Detail Item Component
const DetailItem = ({ label, value, icon, isEmail = false, isPhone = false }) => {
  if (!value) return null;
  let content = value;
  if (isEmail) content = <a href={`mailto:${value}`}>{value}</a>;
  if (isPhone) content = <a href={`tel:${value}`}>{value}</a>;

  return (
    <div className="detail-item">
      <div className="detail-label">
        {icon && <i className={icon}></i>}
        {label}
      </div>
      <div className="detail-value">{content}</div>
    </div>
  );
};

// Utility function: Get logo with multiple fallbacks
const getCompanyLogo = (companyName, fallbackCategory = 'industry') => {
  if (!companyName) return `/default-${fallbackCategory}.png`;

  const domain = companyName.replace(/\s+/g, '').toLowerCase() + '.com';
  const clearbitUrl = `https://logo.clearbit.com/${domain}`;
  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}`;
  const genericFallback = `/default-${fallbackCategory}.png`;

  return { clearbitUrl, googleFaviconUrl, genericFallback };
};

export default CustomerManagement;
