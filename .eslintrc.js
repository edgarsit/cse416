// eslint-disable-next-line @typescript-eslint/no-var-requires
const os = require('os');

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  root: true,
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    'import/extensions': [
      1,
      'never',
    ],
    'react/jsx-filename-extension': [
      1,
      {
        allow: 'as-needed',
        extensions: [
          '.tsx',
        ],
      },
    ],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        ignoreTypeReferences: true,
        // TODO fix
        classes: false,
      },
    ],
    // TODO fix
    // '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
    '@typescript-eslint/no-explicit-any': 'off',
    'max-classes-per-file': ['error', 15],
    'linebreak-style': ['error', (os.EOL === '\r\n' ? 'windows' : 'unix')],
    eqeqeq: ['error', 'smart'],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    // TODO fix + grep eslint
    'no-underscore-dangle': 'off',
    'react/require-default-props': 'off',
    'no-shadow': 'off',
    'consistent-return': 'off',
    'no-bitwise': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-console': 'off',
    'react/jsx-props-no-spreading': 'off',
    '@typescript-eslint/explicit-module-boundary-types': ['warn', { allowArgumentsExplicitlyTypedAsAny: true }],
    'import/prefer-default-export': 'off',
  },
  ignorePatterns: [
    '/build',

  ],
  overrides: [
    {
      files: ['src/server/*.ts'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'ForInStatement',
            message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
          },
          {
            selector: 'LabeledStatement',
            message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
          },
          {
            selector: 'WithStatement',
            message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
          },
        ],
      },
    },
    // TODO fix quality
    {
      files: ['src/common/createCourseSchedule.tsx'],
      rules: {
        'react/jsx-filename-extension': 'off',
        'no-restricted-syntax': 'off',
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        camelcase: 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'class-methods-use-this': 'off',
        'no-empty': 'off',
        'no-plusplus': 'off',
        eqeqeq: 'off',
        'new-cap': 'off',
        'no-constant-condition': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
      },
    },
    {
      files: ['src/common/degreeRequirementImport.tsx'],
      rules: {
        'react/jsx-filename-extension': 'off',
        'max-len': 'off',
      },
    },
  ],
};
