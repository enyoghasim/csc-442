import expoConfig from 'eslint-config-expo/flat.js';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  ...expoConfig,
  eslintConfigPrettier,
  {
    ignores: ['dist/*'],
  },
];
