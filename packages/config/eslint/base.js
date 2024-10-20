module.exports = {
  extends: ["next", "turbo", "plugin:storybook/recommended", "prettier"],
  ignorePatterns: [".coverage/*"],
  rules: {
    "prettier/prettier": ["error"],
    "turbo/no-undeclared-env-vars": "error",
    "jsx-a11y/alt-text": "off",
  },
};