module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "plugin:react/recommended",
        "airbnb",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
        "import/extensions": [
            1,
            "never"
        ],
        "react/jsx-filename-extension": [
            1,
            {
                "allow": "as-needed",
                "extensions": [
                    ".tsx"
                ]
            }
        ],
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": [
            "error",
            {
                "ignoreTypeReferences": true
            }
        ],
        "@typescript-eslint/no-explicit-any": ["error", { "ignoreRestArgs": true }],
        "max-classes-per-file": [
            "error",
             8
        ],
        "linebreak-style": ["error", (require("os").EOL === "\r\n" ? "windows" : "unix")],
        "eqeqeq": ["error", "smart"],
        // TODO fix
        "no-underscore-dangle": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "react/require-default-props": "off",
        "@typescript-eslint/no-unused-vars": "off",
    },
    "ignorePatterns": [
        "/build"
    ]
}