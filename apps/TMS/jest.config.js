// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const customConfig = require('jest-custom-config')

const modules = [
    "dashdoc-utils",
    "@dashdoc/core",
    "@dashdoc/web-core",
    "@dashdoc/web-ui",
    "@here",
    "react-dnd",
    "core-dnd",
    "dnd-core",
    "react-dnd-html5-backend",
    "react-dnd-touch-backend",
    "@react-dnd",
    "react-dnd-preview",
];


module.exports = {
    ...customConfig,
    collectCoverage: true,
    collectCoverageFrom: ["**/src/**/*.ts", "!**/__mocks__/**", "!**/__tests__/**"],
    coverageDirectory: "./coverage/",
    coverageProvider: "v8",
    moduleNameMapper: {
        "\\.(css|scss)$": "identity-obj-proxy",
        "^app/(.*)$": "<rootDir>/src/app/$1",
        "@flow/(.*)$": "<rootDir>/src/flow/$1",
        "^main/(.*)$": "<rootDir>/src/main/$1",
        "^services/(.*)$": "<rootDir>/src/services/$1",
        "^taxation/(.*)$": "<rootDir>/src/taxation/$1",
        "\\.svg$": "<rootDir>/__mocks__/svg.js",
    },
    setupFiles: ["<rootDir>/jest.setup.js"],
    testEnvironment: "jsdom",
    testMatch: ["**/__tests__/*.+(ts|tsx|js)"],
    transformIgnorePatterns: [`/node_modules/(?!(${modules.join("|")})/)"`],
};
