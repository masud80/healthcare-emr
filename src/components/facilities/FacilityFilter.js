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
    dispatch(fetchUserFacilities()).then(() => {
      console.log('User Facilities:', userFacilities);
      // Initialize selectedFacilities with all user facilities if none selected
      if (selectedFacilities.length === 0 && userFacilities.length > 0) {
        const facilityIds = userFacilities.map(f => f.id);
        console.log('Setting selected facilities:', facilityIds);
        dispatch(setSelectedFacilities(facilityIds));
      }
    });
  }, [dispatch]);

  // Separate useEffect for initialization to avoid dependency cycle
  useEffect(() => {
    if (selectedFacilities.length === 0 && userFacilities.length > 0) {
      const facilityIds = userFacilities.map(f => f.id);
      console.log('Initializing selected facilities:', facilityIds);
      dispatch(setSelectedFacilities(facilityIds));
    }
  }, [userFacilities, selectedFacilities.length, dispatch]);

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
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #eee' }}>
            <strong>Available Facilities</strong>
          </div>
          {userFacilities.length > 0 ? (
            userFacilities.map((facility) => (
              <label key={facility.id} className="facility-checkbox">
                <input
                  type="checkbox"
                  checked={selectedFacilities.includes(facility.id)}
                  onChange={() => handleFacilityToggle(facility.id)}
                />
                <span style={{ marginLeft: '8px' }}>{facility.name}</span>
                {facility.type && (
                  <span style={{ marginLeft: '4px', color: '#666', fontSize: '0.9em' }}>
                    ({facility.type})
                  </span>
                )}
              </label>
            ))
          ) : (
            <div className="facility-empty">No facilities assigned</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacilityFilter;
