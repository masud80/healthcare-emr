import React from 'react';

// Mock all MUI components
const createMockComponent = (name) => {
  return function MockComponent(props) {
    return <div data-testid={`mock-${name}`}>{props.children}</div>;
  };
};

export const DatePicker = createMockComponent('DatePicker');
export const LocalizationProvider = createMockComponent('LocalizationProvider');
export const AdapterDateFns = class {
  constructor() {}
  date() { return new Date(); }
  format() { return ''; }
  parse() { return new Date(); }
};

// Export other commonly used MUI components
export const Button = createMockComponent('Button');
export const TextField = createMockComponent('TextField');
export const Container = createMockComponent('Container');
export const Paper = createMockComponent('Paper');
export const Typography = createMockComponent('Typography');
export const Box = createMockComponent('Box');
export const Dialog = createMockComponent('Dialog');
export const DialogTitle = createMockComponent('DialogTitle');
export const DialogContent = createMockComponent('DialogContent');
export const DialogActions = createMockComponent('DialogActions');
