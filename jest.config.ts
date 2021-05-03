import { defaults } from 'jest-config';
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testPathIgnorePatterns: [...defaults.testPathIgnorePatterns, '<rootDir>/build/'],
};

export default config;
