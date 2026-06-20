"use strict";

const globals = require("globals");

module.exports = [
    {
        files: ["src/**/*.js", "test/**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                ...globals.node,
            },
        },
        rules: {
            strict: ["error", "global"],
            "no-undef": "error",
            "no-unused-vars": "error",
            "no-implicit-globals": "error",
        },
    },
];
