// Mock date-fns functions
export const format = jest.fn(date => date.toISOString());
export const parse = jest.fn();
export const isValid = jest.fn(() => true);
export const isDate = jest.fn(() => true);

// Mock other date-fns functions as needed
export const _lib = {
  format: {
    longFormatters: {}
  }
};
