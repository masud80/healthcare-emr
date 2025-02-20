import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { fetchFacilities } from '../../redux/thunks/facilitiesThunks';
import '../../styles/components.css';

const PatientForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const facilities = useSelector((state) => state.facilities.facilities);
  
  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    contact: '',
    email: '',
    address: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    facilityId: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert string arrays to actual arrays
      const processedData = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map(item => item.trim()) : [],
        chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map(item => item.trim()) : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'patients'), processedData);
      navigate('/patients');
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Add New Patient</h1>
      <form onSubmit={handleSubmit} className="paper">
        <div className="grid grid-2-cols">
          <div className="form-control">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="select"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-control">
            <label htmlFor="contact">Contact Number</label>
            <input
              type="tel"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>

        <h2 className="subtitle">Emergency Contact</h2>
        <div className="grid grid-2-cols">
          <div className="form-control">
            <label htmlFor="emergencyContact.name">Name</label>
            <input
              type="text"
              id="emergencyContact.name"
              name="emergencyContact.name"
              value={formData.emergencyContact.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="emergencyContact.relationship">Relationship</label>
            <input
              type="text"
              id="emergencyContact.relationship"
              name="emergencyContact.relationship"
              value={formData.emergencyContact.relationship}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="emergencyContact.phone">Phone</label>
            <input
              type="tel"
              id="emergencyContact.phone"
              name="emergencyContact.phone"
              value={formData.emergencyContact.phone}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>

        <h2 className="subtitle">Medical Information</h2>
        <div className="grid grid-2-cols">
          <div className="form-control">
            <label htmlFor="bloodType">Blood Type</label>
            <select
              id="bloodType"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              className="select"
              required
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="form-control">
            <label htmlFor="allergies">Allergies (comma-separated)</label>
            <input
              type="text"
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Peanuts, Penicillin"
            />
          </div>

          <div className="form-control">
            <label htmlFor="chronicConditions">Chronic Conditions (comma-separated)</label>
            <input
              type="text"
              id="chronicConditions"
              name="chronicConditions"
              value={formData.chronicConditions}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Diabetes, Hypertension"
            />
          </div>

          <div className="form-control">
            <label htmlFor="facilityId">Facility</label>
            <select
              id="facilityId"
              name="facilityId"
              value={formData.facilityId}
              onChange={handleChange}
              className="select"
              required
            >
              <option value="">Select Facility</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="dialog-actions">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="button button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button button-primary"
          >
            Add Patient
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
