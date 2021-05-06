import { defaults } from 'jest-config';
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // TODO combine with "@shelf/jest-mongodb"
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [...defaults.testPathIgnorePatterns, '<rootDir>/build/'],
};

export default config;
