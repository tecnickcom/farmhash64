"use strict";

const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    {
        files: ["src/**/*.js", "test/**/*.js"],
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                ...globals.node,
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            strict: ["error", "global"],
            eqeqeq: "error",
            "prefer-const": "error",
            "no-var": "error",
            "no-undef": "error",
            "no-unused-vars": "error",
            "no-implicit-globals": "error",
        },
    },
];
