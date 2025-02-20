import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedFacilities } from '../../redux/slices/facilitiesSlice';
import { fetchUserFacilities } from '../../redux/thunks/facilitiesThunks';

const FacilityFilter = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { userFacilities, selectedFacilities } = useSelector((state) => state.facilities);

  useEffect(() => {
    dispatch(fetchUserFacilities());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFacilityToggle = (facilityId) => {
    const updatedSelection = selectedFacilities.includes(facilityId)
      ? selectedFacilities.filter(id => id !== facilityId)
      : [...selectedFacilities, facilityId];
    dispatch(setSelectedFacilities(updatedSelection));
  };

  return (
    <div className="facility-filter" ref={dropdownRef}>
      <button 
        className="facility-filter-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        🏥 Facilities ({selectedFacilities.length})
      </button>
      {isOpen && (
        <div className="facility-dropdown">
          {userFacilities.map((facility) => (
            <label key={facility.id} className="facility-checkbox">
              <input
                type="checkbox"
                checked={selectedFacilities.includes(facility.id)}
                onChange={() => handleFacilityToggle(facility.id)}
              />
              <span>{facility.name}</span>
            </label>
          ))}
          {userFacilities.length === 0 && (
            <div className="facility-empty">No facilities assigned</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacilityFilter;
