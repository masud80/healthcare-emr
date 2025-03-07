import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useFeatureFlag = (featureKey, facilityId) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkFeature = async () => {
      try {
        // First get the feature ID from the feature key
        const featuresRef = collection(db, 'features');
        const featureQuery = query(featuresRef, where('key', '==', featureKey));
        const featureSnapshot = await getDocs(featureQuery);
        
        if (featureSnapshot.empty) {
          setIsEnabled(false);
          setLoading(false);
          return;
        }

        const featureId = featureSnapshot.docs[0].id;
        
        // Then check if this feature is enabled for the facility
        const configRef = collection(db, 'feature_configuration');
        const configQuery = query(
          configRef,
          where('featureId', '==', featureId),
          where('facilityId', '==', facilityId),
          where('enabled', '==', true)
        );
        
        const configSnapshot = await getDocs(configQuery);
        setIsEnabled(!configSnapshot.empty);
        setLoading(false);
      } catch (err) {
        console.error('Error checking feature flag:', err);
        setError(err);
        setLoading(false);
      }
    };

    if (featureKey && facilityId) {
      checkFeature();
    } else {
      setLoading(false);
    }
  }, [featureKey, facilityId]);

  return { isEnabled, loading, error };
};

// Usage example:
/*
const MyComponent = ({ facilityId }) => {
  const { isEnabled, loading } = useFeatureFlag('feature_key', facilityId);

  if (loading) return <div>Loading...</div>;

  return isEnabled ? (
    <div>Feature is enabled!</div>
  ) : (
    <div>Feature is disabled</div>
  );
};
*/ 