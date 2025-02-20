// Google Places API utility functions
// Function to load Google Maps script with required libraries
const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    // Get API key from window.config
    const apiKey = window.config?.GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === '%REACT_APP_GOOGLE_PLACES_API_KEY%') {
      reject(new Error('Valid Google Maps API key not found'));
      return;
    }

    // Remove any existing script tags to prevent duplicates
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    existingScripts.forEach(script => script.remove());

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps failed to load'));
      }
    };
    
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
};

// Function to search for pharmacies
export const searchPharmacies = async (searchText) => {
  try {
    // Ensure Google Maps is loaded
    await loadGoogleMapsScript();
    
    // Create a hidden map div if it doesn't exist
    let mapDiv = document.getElementById('google-map-service');
    if (!mapDiv) {
      mapDiv = document.createElement('div');
      mapDiv.id = 'google-map-service';
      mapDiv.style.display = 'none';
      document.body.appendChild(mapDiv);
    }

    // Initialize map (required for Places API)
    const map = new window.google.maps.Map(mapDiv, {
      center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
      zoom: 8
    });

    const service = new window.google.maps.places.PlacesService(map);
    
    // First get predictions using AutocompleteService
    const predictions = await new Promise((resolve, reject) => {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions({
        input: `${searchText} pharmacy`,
        types: ['establishment'],
        componentRestrictions: { country: 'us' }
      }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Place predictions failed: ${status}`));
        }
      });
    });

    // Then get detailed information for each prediction
    const detailedResults = await Promise.all(
      predictions.map(async (prediction) => {
        try {
          const details = await getPlaceDetails(service, prediction.place_id);
          return {
            name: details.name,
            address: details.formatted_address,
            phone: details.formatted_phone_number || '',
            location: details.geometry.location,
            place_id: details.place_id,
            rating: details.rating,
            businessStatus: formatBusinessStatus(details.business_status),
            openingHours: formatOpeningHours(details.opening_hours)
          };
        } catch (error) {
          console.warn(`Failed to get details for ${prediction.description}:`, error);
          // Return basic information if details fetch fails
          return {
            name: prediction.structured_formatting.main_text,
            address: prediction.description,
            place_id: prediction.place_id
          };
        }
      })
    );

    return detailedResults;
  } catch (error) {
    console.error('Error searching pharmacies:', error);
    throw error;
  }
};

// Function to get detailed place information
const getPlaceDetails = (service, placeId) => {
  return new Promise((resolve, reject) => {
    service.getDetails({
      placeId,
      fields: [
        'name',
        'geometry',
        'formatted_address',
        'formatted_phone_number',
        'rating',
        'opening_hours',
        'business_status'
      ]
    }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        resolve(place);
      } else {
        reject(new Error(`Place details failed: ${status}`));
      }
    });
  });
};

// Function to format business status
const formatBusinessStatus = (status) => {
  switch (status) {
    case 'OPERATIONAL':
      return 'Currently operating';
    case 'CLOSED_TEMPORARILY':
      return 'Temporarily closed';
    case 'CLOSED_PERMANENTLY':
      return 'Permanently closed';
    default:
      return '';
  }
};

// Function to format opening hours
const formatOpeningHours = (openingHours) => {
  if (!openingHours?.weekday_text) return null;
  return openingHours.weekday_text;
};

// Export other utility functions
export const initializeAutocomplete = async (inputElement, options = {}) => {
  try {
    await loadGoogleMapsScript();
    
    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      types: options.types || ['establishment', 'geocode'],
      fields: [
        'place_id',
        'geometry',
        'formatted_address',
        'name',
        'formatted_phone_number',
        'opening_hours',
        'business_status'
      ],
      ...options
    });

    return autocomplete;
  } catch (error) {
    console.error('Error initializing autocomplete:', error);
    throw error;
  }
};

export const getPlacePredictions = async (input, options = {}) => {
  try {
    await loadGoogleMapsScript();
    
    const service = new window.google.maps.places.AutocompleteService();
    
    return new Promise((resolve, reject) => {
      service.getPlacePredictions({
        input,
        types: options.types || ['establishment', 'geocode'],
        componentRestrictions: options.componentRestrictions,
        ...options
      }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          reject(new Error(`Place predictions failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error getting place predictions:', error);
    throw error;
  }
};

export const geocodeAddress = async (address) => {
  try {
    await loadGoogleMapsScript();
    
    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
          resolve(results[0]);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

export const reverseGeocode = async (latLng) => {
  try {
    await loadGoogleMapsScript();
    
    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
          resolve(results[0]);
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
};

export const initializeMap = async (mapElement, center = { lat: 40.7128, lng: -74.0060 }) => {
  await loadGoogleMapsScript();
  
  const map = new window.google.maps.Map(mapElement, {
    center,
    zoom: 13,
    mapId: 'pharmacy-map'
  });

  return {
    map,
    AdvancedMarkerElement: window.google.maps.marker.AdvancedMarkerElement,
    googleMaps: window.google.maps
  };
};
