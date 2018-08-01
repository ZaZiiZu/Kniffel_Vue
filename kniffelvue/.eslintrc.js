module.exports = {
  root: true,
  env: {
    node: true
    },
  plugins: ['vue'], // enable vue plugin
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    "comma-dangle": ["error", "only-multiline"],
    "semi": "off",
    "no-extra-semi": "off",
    "no-multiple-empty-lines": "off",
    "no-multi-spaces": "off",
    "keyword-spacing": "off",
    "quotes": "off",
    "spaced-comment": "off",
    "space-unary-ops": "off",
    "space-before-function-paren": "off",
    "padded-blocks": "off",
    "camelcase": "off",
    "linebreak-style": "off",
    "prefer-template": "off",
    "no-console": "off",
    "no-alert": "off",
    "no-mixed-operators": "off",
    "func-names": "off",
    "no-plusplus": "off",
    "prefer-spread": "off",
    "max-len": "off",
    "no-nested-ternary": "off",
    "object-shorthand": "off",
    "no-use-before-define": ["error", {
      "functions": false,
      "classes": true
    }],
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}