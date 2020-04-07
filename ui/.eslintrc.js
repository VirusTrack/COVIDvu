module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        jest: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly"
    },
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2018,
        sourceType: "module"
    },
    plugins: [
        "react",
        "react-hooks",
    ],
    rules: {
        "react/prop-types": 0,
        semi: ["error", "never"]
    },
    settings: {
        react: {
          version: "detect"
        }
    }
}