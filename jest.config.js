module.exports = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './.babelrc' }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library|@babel|@mui|@emotion|@adobe|css-tools|@reduxjs|redux|react-redux)/)'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  moduleDirectories: ['node_modules', 'src'],
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  globals: {
    'babel-jest': {
      diagnostics: false,
      targets: {
        node: 'current'
      }
    }
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  resolver: undefined,
  extensionsToTreatAsEsm: ['.jsx'],
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library|@babel|@mui|@emotion|@adobe|css-tools|@reduxjs|redux|react-redux)/)'
  ],
  moduleNameMapper: {
    '^@testing-library/(.*)$': '<rootDir>/node_modules/@testing-library/$1',
    '^@mui/(.*)$': '<rootDir>/node_modules/@mui/$1',
    '^@emotion/(.*)$': '<rootDir>/node_modules/@emotion/$1',
    '^@adobe/(.*)$': '<rootDir>/node_modules/@adobe/$1',
    '^@reduxjs/(.*)$': '<rootDir>/node_modules/@reduxjs/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js'
  }
};
