// Mock DatePicker component
import React from 'react';

export const DatePicker = ({ value, onChange, ...props }) => {
  return <input type="date" value={value} onChange={(e) => onChange(e.target.value)} {...props} />;
};

// Mock LocalizationProvider component
export const LocalizationProvider = ({ children }) => {
  return <div>{children}</div>;
};
