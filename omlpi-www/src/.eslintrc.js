module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  extends: ['airbnb-base', 'plugin:vue/essential'],
  // required to lint *.vue files
  plugins: ['vue'],
};
