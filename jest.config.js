export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(svg|png|jpg|jpeg|gif)$': 'jest-transform-stub'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/(*.)+(spec|test).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'src/components/ChooseProject.tsx',
    'src/components/ErrorAlert.tsx',
    'src/components/Footer.tsx',
    'src/components/Header.tsx',
    'src/components/IssueRow.tsx',
    'src/components/ListProjects.tsx',
    'src/components/Loading.tsx'
  ],
  watchman: false
};
