import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
    js.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat["jsx-runtime"],
    {
        files: ["src/**/*.{js,jsx}"],
        plugins: { "react-hooks": reactHooks },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: { ...globals.browser, require: "readonly", process: "readonly" },
        },
        settings: { react: { version: "detect" } },
        rules: {
            "react-hooks/rules-of-hooks": "error",
        },
    },
];
